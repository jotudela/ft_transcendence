// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Tournament {

    struct Player {
        string nickname;
        uint rank;
        uint points;
    }

    mapping(uint => Player) public map;
    uint[] private players;

    event PlayerRegistered(uint indexed playerId, string nickname, uint rank, uint points);

    constructor(uint[] memory _id, string[] memory _nicknames, uint[] memory _ranks, uint[] memory _points) {
        require(
            _id.length == _nicknames.length && 
            _id.length == _ranks.length && 
            _id.length == _points.length, "Arrays must match length");

        for (uint i = 0; i < _id.length; i++) {
            map[_id[i]] = Player(_nicknames[i], _ranks[i], _points[i]);
            players.push(_id[i]);
            emit PlayerRegistered(_id[i], _nicknames[i], _ranks[i], _points[i]);
        }
    }

    function getAllPlayers() public view returns (Player[] memory) {
        Player[] memory list = new Player[](players.length);
        for (uint i = 0; i < players.length; i++) {
            list[i] = map[players[i]];
        }
        return list;
    }
}