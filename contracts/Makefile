all: liquid solidity

solidity: ca.sol meta.sol
	docker run -v ${shell pwd}:/a -u $(shell id -u):$(shell id -g) -w /a --rm ethereum/solc:stable --abi --bin -o build --overwrite $^

liquid: r t

r: record/Cargo.toml $(wildcard record/src/*)
	cd record && cargo liquid build

t: trace/Cargo.toml $(wildcard trace/src/*)
	cd trace && cargo liquid build

.PHONY: clean

clean:
	rm -r build && rm -r **/target
