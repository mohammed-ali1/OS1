/**
 * Created by anwar on 10/4/14.
 */

module TSOS{

    export enum Process {New, Running, Terminated, Killed, Waiting}

    export class Pcb{

        private static PID: number = -1;    //Start at -1 so we can start incrementing from 0!
        private pid:number = Pcb.PID;
        private pc:number = 0;
        private acc:number = 0;
        private ir:string = "";
        private x:number = 0;
        private y:number = 0;
        private z:number = 0;
        private base: number = 0;
        private limit:number = 0;
        private state:string = "?";
        private length:number = 0; //Length of the program
        private block : number = 0;
        private priority:number = 0;
        private location:string = "";
        private printLocation:string = "";
        private timeArrived : number = 0;
        private timeFinished: number = 0;

        constructor(b:number, l:number, p:number){

            Pcb.PID++;
            this.pid = Pcb.PID;  //Increment PID all the time!
            this.base = b;
            this.pc = 0;
            this.limit = l;
            if(this.base == -1){
                this.block = -1;
            }else{
                this.block = (this.base / _BlockSize);
            }
            this.priority = p;
        }

        public getPid() : number{
            return this.pid;  //return the loc al data member (NON - STATIC)
        }

        public setLength(length:number){
            this.length = (this.base+length);
        }

        public setState(s:number){

            switch (s){
                case 1:
                    this.state = "Running";
                    break;
                case 2:
                    this.state = "Waiting";
                    break;
                case 3:
                    this.state = "Ready";
                    break;
                case 4:
                    this.state = "Terminated";
                    break;
                case 5:
                    this.state = "Killed";
                    break;
                default :
                    this.state = "New";
            }
        }

        public setLocation(location){
            this.location = location;
        }

        public getLocation(){
            return this.location;
        }

        public setPrintLocation(location){
            this.printLocation = location;
        }

        public getPrintLocation(){
            return this.printLocation;
        }

        public getPriority():number{
            return this.priority;
        }

        public getState(){
            return this.state;
        }

        public getLimit(){
            return this.limit;
        }

        public setLimit(limit){
            this.limit = limit;
        }

        public setBase(base){
            this.base = base;
        }

        public setBlock(block){
            this.block = block;
        }

        public getBase(){
            return this.base;
        }

        public getLength(){
            return this.length;
        }

        public getX(){
            return this.x;
        }

        public getY(){
            return this.y;
        }

        public getZ(){
            return this.z;
        }

        public getIR(){
            return this.ir;
        }

        public getAcc(){
            return this.acc;
        }

        public getPc(){
            return this.pc;
        }

        public setPc(pc:number){
            this.pc = pc;
        }

        public setX(x:number){
            this.x = x;
        }

        public setY(y:number){
            this.y = y;
        }

        public setZ(z:number){
            this.z = z;
        }

        public setAcc(acc:number){
            this.acc = acc;
        }

        public setIr(ir:string){
            this.ir = ir;
        }

        public setTimeArrived(time: number){
            this.timeArrived = time;
        }

        public setTimeFinished(time:number){
            this.timeFinished = time;
        }

        public getBlock(){
            return this.block;
        }

        public getTimeArrived(){
            return this.timeArrived;
        }

        public getTimeFinished(){
            return this.timeFinished;
        }

        public setPriority(p){
           this.priority = p;
        }

        public static displayTimeMonitor(){

            var table = "<table>";

            table += "<th>PID</th>";
            table += "<th>Arrived</th>";
            table += "<th>Terminated</th>";
            table += "<th>Turnaround</th>";

            for(var i=_TerminatedQueue.length-1; i>=0;i--){
                var p:TSOS.Pcb = _TerminatedQueue[i];
                table += "<tr>";
                table += "<td>" + p.getPid() + "</td>";
                table += "<td>" + p.getTimeArrived() + "</td>";
                table += "<td>" + p.getTimeFinished() + "</td>";
                table += "<td>" + parseInt(p.getTimeFinished() - p.getTimeArrived()) + "</td>";
                table += "</tr>";
            }

            table += "</table>";
            document.getElementById("monitor").innerHTML = table;

        }
    }
}