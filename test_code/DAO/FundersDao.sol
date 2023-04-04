//SPDX-License-Identifier:MIT

pragma solidity ^0.8.0;

import "./AccessControl.sol";
import "./ReentrancyGuard.sol";

contract FundersDao is ReentrancyGuard, AccessControl {
  uint128 public proposalCount = 0;
  bytes32 public constant MEMBER = keccak256("MEMBER");
  bytes32 public constant STAKEHOLDER = keccak256("STAKEHOLDER");
  uint128 constant votingPeriod = 3 days;


  struct Funding {
    address payer;
    uint256 amount;
    uint256 timestamp;
  }

  struct Proposal {
    uint256 id;
    uint256 amount;
    uint256 livePeriod;
    uint256 voteInFavor;
    uint256 voteAgainst;
    string title;
    string desc;
    bool isCompleted;
    bool isPaid;
    address payable receiverAddress;
    address proposer;
    uint256 totalFundRaised;
    Funding[] funders;
  }

  mapping(uint256 => Proposal) private proposals;
  mapping(address => uint256) private stakeholders;
  mapping(address => uint256) private members;
  mapping(address => uint256[]) private votes;

  modifier onlyMembers(string memory message) {
    require(hasRole(MEMBER, msg.sender), message);
    _;
  }

  modifier onlyStakeholders(string memory message) {
    require(hasRole(STAKEHOLDER, msg.sender), message);
    _;
  }

  event newProposal(address proposer, uint256 amount);

  function createProposal(
    string calldata title,
    string calldata desc,
    address receiverAddress,
    uint256 amount
  ) public payable onlyMembers("Only Members can create proposals") {
    require(
      msg.value == 5 * 10**18,
      "you need to add 5 MATIC to create a proposal"
    );
    uint256 proposalId = proposalCount;
    Proposal storage proposal = proposals[proposalId];
    proposal.id = proposalId;
    proposal.title = title;
    proposal.desc = desc;
    proposal.amount = amount;
    proposal.receiverAddress = payable(receiverAddress);
    proposal.proposer = payable(msg.sender);
    proposal.livePeriod = block.timestamp + votingPeriod;
    proposal.isCompleted = false;
    proposal.isPaid = false;
    proposalCount++;
    emit newProposal(msg.sender, amount);
  }

  function getAllProposals() public view returns (Proposal[] memory) {
    Proposal[] memory allProposals = new Proposal[](proposalCount);
    for (uint256 i = 0; i < proposalCount; i++) {
      allProposals[i] = proposals[i];
    }
    return allProposals;
  }

  function getProposal(uint256 proposalId)
    public
    view
    returns (Proposal memory)
  {
    return proposals[proposalId];
  }

  function getVotes()
    public
    view
    onlyStakeholders("Only stakeholders can see the votes")
    returns (uint256[] memory)
  {
    return votes[msg.sender];
  }

  function getStakeholdersBal()
    public
    view
    onlyStakeholders("Only stakeholders can see the votes")
    returns (uint256)
  {
    return stakeholders[msg.sender];
  }

  function getMemberBal()
    public
    view
    onlyMembers("Only Members can call this function.")
    returns (uint256)
  {
    return members[msg.sender];
  }

  function isStakeholder() public view returns (bool) {
    return stakeholders[msg.sender] > 0;
  }

  function isMember() public view returns (bool) {
    return members[msg.sender] > 0;
  }

  function vote(uint256 proposalId, bool inFavour)
    public
    onlyStakeholders("Only stakeholders can vote")
  {
    Proposal storage proposal = proposals[proposalId];
    if (proposal.isCompleted || proposal.livePeriod <= block.timestamp) {
      proposal.isCompleted = true;
      revert("Time period for this proposal is ended");
    }

    for (uint256 i = 0; i < votes[msg.sender].length; i++) {
      if (proposal.id == votes[msg.sender][i]) {
        revert("You can only vote once");
      }
    }
    if (inFavour) proposal.voteInFavor++;
    else proposal.voteAgainst++;
    votes[msg.sender].push(proposalId);
  }

  function provideFunds(uint256 proposalId, uint256 fundAmount)
    public
    payable
    onlyStakeholders("Only Stakeholders can make payments")
  {
    Proposal storage proposal = proposals[proposalId];

    if (proposal.isPaid) revert("Proposal already paid out.");
    if (proposal.voteInFavor <= proposal.voteAgainst)
      revert("This proposal is not selected for funding.");
    if (proposal.totalFundRaised >= proposal.amount)
      revert("Proposal funding goal already reached.");
    proposal.totalFundRaised += fundAmount;
    proposal.funders.push(Funding(msg.sender, fundAmount, block.timestamp));
    if (proposal.totalFundRaised >= proposal.amount) {
      proposal.isCompleted = true;
    }
  }

  function releaseFunding(uint256 proposalId)
    public
    payable
    onlyStakeholders("Only Stakeholders are allowed to release funds")
  {
    Proposal storage proposal = proposals[proposalId];

    if (proposal.totalFundRaised <= proposal.amount) {
      revert("Requested funding goal is not met. Please provide funds.");
    }
    proposal.receiverAddress.transfer(proposal.totalFundRaised);
    proposal.isPaid = true;
    proposal.isCompleted = true;
  }

  function createStakeholder() public payable {
    uint256 amount = msg.value;
    if (!hasRole(STAKEHOLDER, msg.sender)) {
      uint256 total = members[msg.sender] + amount;
      if (total >= 2 ether) {
        _setupRole(STAKEHOLDER, msg.sender);
        _setupRole(MEMBER, msg.sender);
        stakeholders[msg.sender] = total;
        members[msg.sender] += amount;
      } else {
        _setupRole(MEMBER, msg.sender);
        members[msg.sender] += amount;
      }
    } else {
      members[msg.sender] += amount;
      stakeholders[msg.sender] += amount;
    }
  }
}