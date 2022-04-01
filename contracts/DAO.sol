// SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "./IERC20Dec.sol";

contract DAO is AccessControl {

    bytes32 public constant CHAIRMAN_ROLE = keccak256("CHAIRMAN_ROLE");
    using EnumerableMap for EnumerableMap.UintToAddressMap;
    
    event Deposit(address indexed spender, uint amount);
    event Withdraw(address indexed recipient, uint amount);
    event FinishProposal(uint indexed id, bool accepted, bool successfulCall);
    event AddProposal(uint indexed id, address recipient, string description);
    event Vote(address indexed member, uint indexed id, bool support, uint numOfVotes);

    struct Member {
        uint tokens;
        mapping(uint => uint) voted;
        EnumerableMap.UintToAddressMap activeVote;
    }

    struct Proposal {
        uint numOfYes;
        uint numOfNo;
        uint startTime;
        bool finished;
        address recipient;
        address[] votedAddr;
        string description;
        bytes signature;
    }

    address public voteToken;
    uint public totalProposals;
    uint public minimumQuorum;
    uint public debatingPeriodDuration;

    constructor(address _chairPerson, address _voteToken, uint _minimumQuorum, uint _debatingPeriod) {
        _setupRole(CHAIRMAN_ROLE, _chairPerson);
        voteToken = _voteToken;
        minimumQuorum = _minimumQuorum;
        debatingPeriodDuration = _debatingPeriod;
    }

    mapping (address => Member) members;
    mapping (uint => Proposal) public proposals;

    function addProposal(bytes calldata _signature, address _recipient, string calldata _description) public onlyRole(CHAIRMAN_ROLE) {
        proposals[totalProposals].recipient = _recipient;
        proposals[totalProposals].signature = _signature;
        proposals[totalProposals].description = _description;
        proposals[totalProposals].startTime = block.timestamp;
        totalProposals++;

        emit AddProposal(totalProposals - 1, _recipient, _description);
    }

    function deposit(uint _amount) public {
        members[msg.sender].tokens += _amount;
        IERC20Dec(voteToken).transferFrom(msg.sender, address(this), _amount);

        emit Deposit(msg.sender, _amount);
    }

    function vote(uint _id, bool _support) public {
        require(!proposals[_id].finished, "DAO::vote:finished");
        require(proposals[_id].recipient != address(0), "DAO::vote:proposal not found");
        require(members[msg.sender].tokens - members[msg.sender].voted[_id] > 0, "DAO::vote:not enough tokens");
        uint numOfVotes;

        if (members[msg.sender].voted[_id] == 0) {
            members[msg.sender].activeVote.set(_id, msg.sender);
            proposals[_id].votedAddr.push(msg.sender);
        }

        numOfVotes = (members[msg.sender].tokens - members[msg.sender].voted[_id]) / 10 ** IERC20Dec(voteToken).decimals();
        members[msg.sender].voted[_id] += members[msg.sender].tokens - members[msg.sender].voted[_id];

        if (_support) {
            proposals[_id].numOfYes += numOfVotes;
        } else {
            proposals[_id].numOfNo += numOfVotes;
        }
        
        emit Vote(msg.sender, _id, _support, numOfVotes);
    }

    function finishProposal(uint _id) public {
        require(!proposals[_id].finished, "DAO::finishProposal:finished");
        require(proposals[_id].recipient != address(0), "DAO::finishProposal:proposal not found");
        require(block.timestamp - proposals[_id].startTime > debatingPeriodDuration, "DAO::finishProposal:the debate is not over yet");

        uint allVotes;
        bool accepted;

        proposals[_id].finished = true;
        allVotes = proposals[_id].numOfYes + proposals[_id].numOfNo;

        if ( (proposals[_id].numOfYes / allVotes * 100 >= 51) && (proposals[_id].numOfYes + proposals[_id].numOfNo >= minimumQuorum) ) {
            accepted = true;
        } else {
            accepted = false;
        }

        for (uint i = 0; i < proposals[_id].votedAddr.length; i++) {
            members[proposals[_id].votedAddr[i]].activeVote.remove(_id);
        }

        (bool success, ) = proposals[_id].recipient.call{value: 0}(proposals[_id].signature);
        emit FinishProposal(_id, accepted, success);
    }


    function withdraw() public {
        require(members[msg.sender].activeVote.length() == 0, "DAO::withdraw:not all proposal finished");
        uint sendValue; 

        sendValue = members[msg.sender].tokens;
        IERC20Dec(voteToken).transfer(msg.sender, sendValue);
        
        emit Withdraw(msg.sender, sendValue);
    }

}