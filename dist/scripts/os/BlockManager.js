/**
* Created by anwar on 11/7/14.
*/
var TSOS;
(function (TSOS) {
    var BlockManager = (function () {
        function BlockManager(newList) {
            this.list = newList;
        }
        BlockManager.getNextBlock = function () {
            if (_ResidentQueue.length >= 3) {
                return -1;
            }
            return parseInt(_ResidentQueue.length * _BlockSize);
        };
        return BlockManager;
    })();
    TSOS.BlockManager = BlockManager;
})(TSOS || (TSOS = {}));
