// SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract TestDAO is AccessControl {
    bytes32 public constant DAO_ROLE = keccak256("DAO_ROLE");

    constructor(address _DAO) {
        _setupRole(DAO_ROLE, _DAO);
    }

    function test1() public view onlyRole(DAO_ROLE) returns(string memory) {
        return "Hello";
    }

    function sum(uint a, uint b) public view onlyRole(DAO_ROLE) returns(uint) {
        return a+b;
    }
}