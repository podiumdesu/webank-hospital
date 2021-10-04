use crate::rescue;
use crate::utils::{are_equal, is_zero, EvaluationResult};
use winterfell::{
    math::{fields::f128::BaseElement, FieldElement},
    Air, AirContext, Assertion, ByteWriter, EvaluationFrame, ExecutionTrace, ProofOptions,
    Serializable, TraceInfo, TransitionConstraintDegree,
};

const CYCLE_LENGTH: usize = 16;
const NUM_HASH_ROUNDS: usize = 14;

const CYCLE_MASK: [BaseElement; CYCLE_LENGTH] = [
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ZERO,
    BaseElement::ZERO,
];

const CYCLE_MASK2: [BaseElement; CYCLE_LENGTH] = [
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ONE,
    BaseElement::ZERO,
];

pub struct PublicInputs {
    pub r1: [BaseElement; 2],
    pub result: [BaseElement; 2],
}

impl Serializable for PublicInputs {
    fn write_into<W: ByteWriter>(&self, target: &mut W) {
        target.write(&self.r1[..]);
        target.write(&self.result[..]);
    }
}

pub struct RescueAir {
    context: AirContext<BaseElement>,
    r1: [BaseElement; 2],
    result: [BaseElement; 2],
}

impl Air for RescueAir {
    type BaseElement = BaseElement;
    type PublicInputs = PublicInputs;

    fn new(trace_info: TraceInfo, pub_inputs: PublicInputs, options: ProofOptions) -> Self {
        let degrees = vec![
            TransitionConstraintDegree::with_cycles(3, vec![CYCLE_LENGTH]),
            TransitionConstraintDegree::with_cycles(3, vec![CYCLE_LENGTH]),
            TransitionConstraintDegree::with_cycles(3, vec![CYCLE_LENGTH]),
            TransitionConstraintDegree::with_cycles(3, vec![CYCLE_LENGTH]),
        ];
        RescueAir {
            context: AirContext::new(trace_info, degrees, options),
            r1: pub_inputs.r1,
            result: pub_inputs.result,
        }
    }

    fn context(&self) -> &AirContext<Self::BaseElement> {
        &self.context
    }

    fn evaluate_transition<E: FieldElement + From<Self::BaseElement>>(
        &self,
        frame: &EvaluationFrame<E>,
        periodic_values: &[E],
        result: &mut [E],
    ) {
        let current = frame.current();
        let next = frame.next();
        let flag1 = periodic_values[0];
        let flag2 = periodic_values[1];
        let ark = &periodic_values[2..];

        rescue::enforce_round(result, current, next, ark, flag1);

        if flag1 == FieldElement::ZERO {
            result.agg_constraint(0, FieldElement::ONE, are_equal(current[0], next[0]));
            result.agg_constraint(1, FieldElement::ONE, are_equal(current[1], next[1]));
            result.agg_constraint(2, flag2, is_zero(next[2]));
            result.agg_constraint(3, flag2, is_zero(next[3]));
        }
    }

    fn get_assertions(&self) -> Vec<Assertion<Self::BaseElement>> {
        let first_round = self.trace_length() / 2;
        let second_round = self.trace_length() - 1;
        vec![
            Assertion::single(2, first_round, self.r1[0]),
            Assertion::single(3, first_round, self.r1[1]),
            Assertion::single(0, second_round, self.result[0]),
            Assertion::single(1, second_round, self.result[1]),
        ]
    }

    fn get_periodic_column_values(&self) -> Vec<Vec<Self::BaseElement>> {
        let mut result = vec![CYCLE_MASK.to_vec(), CYCLE_MASK2.to_vec()];
        result.append(&mut rescue::get_round_constants());
        result
    }
}

pub fn build_trace(r0: [BaseElement; 2], r1: [BaseElement; 2]) -> ExecutionTrace<BaseElement> {
    let mut trace = ExecutionTrace::new(4, 2 * CYCLE_LENGTH);

    trace.fill(
        |state| {
            state[0] = BaseElement::ZERO;
            state[1] = BaseElement::ZERO;
            state[2] = r0[0];
            state[3] = r0[1];
        },
        |step, state| {
            if (step % CYCLE_LENGTH) < NUM_HASH_ROUNDS {
                rescue::apply_round(state, step);
            } else {
                if step == CYCLE_LENGTH - 1 {
                    state[2] = r1[0];
                    state[3] = r1[1];
                } else {
                    state[2] = BaseElement::ZERO;
                    state[3] = BaseElement::ZERO;
                }
            }
        },
    );

    trace
}

