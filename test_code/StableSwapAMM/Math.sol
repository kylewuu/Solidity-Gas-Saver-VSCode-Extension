library Math {
    function abs(uint x, uint y) internal pure returns (uint) {
        return x >= y ? x - y : y - x;
    }
}