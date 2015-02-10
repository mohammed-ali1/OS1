///<reference path="../globals.ts" />

/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In _CPU manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public IR: string = "?",
                    public INS: string = "",
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false) {
        }

        public reset(){
            _CPU.PC = 0;
            _CPU.Acc = 0;
            _CPU.IR = "0";
            _CPU.INS = "CPU [ ]";
            _CPU.Xreg = 0;
            _CPU.Yreg = 0;
            _CPU.Zflag = 0;
            _CPU.isExecuting = false;
        }

        public startProcessing(process:TSOS.Pcb): void {
            _CPU.PC = process.getPc();
            _CPU.Acc = process.getAcc();
            _CPU.IR = process.getIR();
            _CPU.INS = "";
            _CPU.Xreg = process.getX();
            _CPU.Yreg = process.getY();
            _CPU.Zflag = process.getZ();
            _CPU.isExecuting = true;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set _CPU.isExecuting appropriately.

            //Read Stuff from Memory @ Program Counter
            this.manageOpCodes(_MemoryManager.read(_CPU.PC));

            //Update the Memory if Any Changes!
            _MemoryManager.update();

            //Update the CPU Table
            _CPU.displayCPU();

            //Update PCB
            _CPU.updatePcb(_CurrentProcess);

            Shell.updateReadyQueue();
        }

        public displayCPU(){
            document.getElementById("pc").innerHTML = _CPU.PC.toString(); //Off by one IDK why!
            document.getElementById("acc").innerHTML = _CPU.Acc.toString();
            document.getElementById("ir").innerHTML = _CPU.IR;
            document.getElementById("x").innerHTML = _CPU.Xreg.toString();
            document.getElementById("y").innerHTML = _CPU.Yreg.toString();
            document.getElementById("z").innerHTML = _CPU.Zflag.toString();
            document.getElementById("instruction").innerHTML = _CPU.INS;
            if(_CPU.PC == 0) {
                document.getElementById("instruction").style.color = "#B22222";
            }else{
                document.getElementById("instruction").style.color = "#006600";
            }
        }

        /**
         * Execute these op codes.
         * @param str
         */
        public manageOpCodes(str){

            str = str.toString();

            if(str.toUpperCase() == "A9"){
                _CPU._A9_Instruction(str);
            }
            else if(str == "AD"){
                _CPU._AD_Instruction(str);
            }
            else if(str == "8D"){
                _CPU._8D_Instruction(str);
            }
            else if(str == "6D"){
                _CPU._6D_Instruction(str);
            }
            else if(str == "A2"){
                _CPU._A2_Instruction(str);
            }
            else if(str == "AE"){
                _CPU._AE_Instruction(str);
            }
            else if(str == "A0"){
                _CPU._A0_Instruction(str);
            }
            else if(str == "AC"){
                _CPU._AC_Instruction(str);
            }
            else if(str == "EA"){
                _CPU._EA_Instruction(str);
            }
            else if(str == "00"){
                _CPU._00_Instruction(str);
            }
            else if(str == "EC"){
                _CPU._EC_Instruction(str);
            }
            else if(str == "D0"){
                _CPU._D0_Instruction(str);
            }
            else if(str == "EE"){
                _CPU._EE_Instruction(str);
            }
            else if(str == "FF"){
                _CPU._FF_Instruction(str);
            }
            else{
                _KernelInterruptQueue.enqueue(new Interrupt(_InvalidOpCode,0));
            }
            _CPU.PC++;
        }

        /**
         * Load the accumulator with a constant
         * Takes 1 parameter (Constant)
         */
        public _A9_Instruction(str:string){

            _CPU.IR = str;
            _CPU.PC++;
            _CPU.Acc = parseInt(_MemoryManager.read(_CPU.PC),16);
            _CPU.INS = "CPU   [LDA #$" + _CPU.Acc.toString(16) + "]" +
                "   ["+_CPU.IR+", "+_CPU.Acc.toString(16)+"]";
        }

        /**
         * Load the accumulator from the  Memory
         * Takes 2 parameters.
         */
        public _AD_Instruction(str:string){

            _CPU.IR = str;
            var address = _CPU.loadTwoBytes();  //load 2 bytes
            _CPU.Acc = (parseInt(_MemoryManager.read(address),16)); //store in the Acc from memory
            _CPU.INS = "CPU   [LDA $00" + address.toString(16) + "]   " +
                "[" +_CPU.IR+", "+address.toString(16)+", 00]";
        }

        /**
         * Store the Accumulator in the memory.
         * @private
         */
        public _8D_Instruction(str:string){

            _CPU.IR = str;
            var address = _CPU.loadTwoBytes(); //load 2 bytes
            _MemoryManager.store(address,_CPU.Acc.toString(16)); //store in hex
            _CPU.INS = "CPU   [STA $00" +address.toString(16) + "]   " +
                "["+_CPU.IR+", "+address.toString(16)+", 00]";
        }

        /**
         * Add the contents of Address to ACC and store it in ACC.
         * @private
         */
        public _6D_Instruction(str:string){

            _CPU.IR = str;
            var address = _CPU.loadTwoBytes(); // load 2 bytes
            var value = parseInt(_MemoryManager.read(address),16);
            _CPU.Acc += value;
            _CPU.INS = "CPU   [ADC   $00" + address.toString(16) + "]" +
                "   ["+_CPU.IR+", "+ address.toString(16)+", 00]";
        }

        /**
         * Load the X-Reg with Constant
         * @private
         */
        public _A2_Instruction(str:string){

            _CPU.IR = str;
            _CPU.PC++;
            var temp = _MemoryManager.read(_CPU.PC); //Get the value first
            _CPU.Xreg = parseInt(temp.toString(),16);//store into x-reg as hex
            _CPU.INS = "CPU   [LDX   #$" + temp + "]" +
                "   ["+_CPU.IR+", "+temp+"]";
        }

        /**
         * Load the X-Reg from Memory
         * @private
         */
        public _AE_Instruction(str:string){

            _CPU.IR = str;
            var address = _CPU.loadTwoBytes(); // load 2 bytes
            _CPU.Xreg = parseInt(_MemoryManager.read(address),16);
            _CPU.INS = "CPU   [LDX   $00" + address.toString(16) + "]" +
                "   ["+_CPU.IR+", "+address.toString(16)+", 00]";
        }

        /**
         * Load the Y-Reg with Constant
         * @private
         */
        public _A0_Instruction(str:string){

            _CPU.IR = str;
            _CPU.PC++;
            var temp = _MemoryManager.read(_CPU.PC); //get the value first
            _CPU.Yreg = parseInt(temp.toString(),16); //store into y-reg as hex
            _CPU.INS = "CPU   [LDY   #$" + temp + "]" +
                "   ["+_CPU.IR+", "+temp+"]";
        }

        /**
         * Load the Y_Reg from Memory
         * @private
         */
        public _AC_Instruction(str:string){

            _CPU.IR = str;
            var address = _CPU.loadTwoBytes(); // load 2 bytes
            _CPU.Yreg = parseInt(_MemoryManager.read(address),16);
            _CPU.INS = "CPU   [LDY   $00" + address.toString(16)+ "]" +
                "   ["+_CPU.IR+", "+address.toString(16)+", 00]";
        }

        /**
         * No Operation
         * @private
         */
        public _EA_Instruction(str:string){
            _CPU.INS = "CPU   [EA]";  //Ha Ha _CPU was easy!
            return;
        }

        /**
         * Break
         * @private
         */
        public _00_Instruction(str:string){

            _CPU.IR = str;
            _CPU.INS = "CPU   [00]";
            var int = new Interrupt(_Break,0);  //Pass -1 to re-start CPU.
            _KernelInterruptQueue.enqueue(int);
        }

        /**
         * Compare a byte in Memory to the X-Reg
         * Set Z-Flag to if Equal
         * @private
         */
        public _EC_Instruction(str:string){

            _CPU.IR = str;
            var address = _CPU.loadTwoBytes(); // load 2 bytes
            var value = parseInt(_MemoryManager.read(address),16); // get the contents of the address.

            if(value == _CPU.Xreg){
                _CPU.Zflag = 1;
            }else{
                _CPU.Zflag = 0;
            }

            _CPU.INS = "CPU   [EC   $00" + address.toString(16) + "]" +
                "   ["+_CPU.IR+ ", "+address.toString(16)+", 00]";
        }

        /**
         * Branch X bytes if Z-Flag Equals 0!
         * @private
         */
        public _D0_Instruction(str:string){

            _CPU.IR = str;

            if(_CPU.Zflag == 0){

                var address:number = parseInt(_MemoryManager.read(++_CPU.PC),16);
                _CPU.PC += address;

                if(_CPU.PC > _BlockSize){
                    _CPU.PC -= _BlockSize;
                }
                _CPU.INS = "CPU [D0 $EF]" +
                    "   ["+_CPU.IR+", "+address+"]";
            }
            else{
                _CPU.PC++;
                _CPU.INS = "CPU [D0 $EF]" +
                    "   ["+_CPU.IR+", "+address+"]";
            }
        }

        /**
         * Increment the value by a byte.
         * @private
         */
        public _EE_Instruction(str:string){
            _CPU.IR = str;
            var address = _CPU.loadTwoBytes(); // load 2 bytes
            var value = parseInt(_MemoryManager.read(address),16); //get the address contents
            value++; // increment
            _MemoryManager.store(address,value.toString(16)); //store value at the address
            _CPU.INS = "CPU [EC $00" + address.toString(16)+"]" +
                "[   "+_CPU.IR+", "+address.toString(16)+", 00]";
        }

        /**
         * System Call!
         * @private
         */
        public _FF_Instruction(str:string){
            _CPU.IR = str;
            _KernelInterruptQueue.enqueue(new Interrupt(_SystemCall,_CPU.Xreg));
            _CPU.INS = "CPU [SYS]" +
                "   ["+_CPU.IR+"]";
        }

        public loadTwoBytes():number{
            var first:number = parseInt(_MemoryManager.read(++_CPU.PC),16);
            var second:number = parseInt(_MemoryManager.read(++_CPU.PC),16);
            return parseInt((first+second));
        }

        /**
         * Updates the process state
         * @param p
         */
        public updatePcb(p:Pcb){

            p.setPc(_CPU.PC);
            p.setAcc(_CPU.Acc);
            p.setIr(_CPU.IR);
            p.setX(_CPU.Xreg);
            p.setY(_CPU.Yreg);
            p.setZ(_CPU.Zflag);
        }
    }
}