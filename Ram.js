const fs = require('fs');

const Ansi = require('./Ansi.js');
const Format = require('./Format.js');

module.exports.Class = class Ram {

   //
   // constructor
   //
   constructor() {

      this.bankSize = 4096;
      this.pageSize = 256;
      this.renderAddress = 0;

      this.ansi = new Ansi.Class();
      this.format = new Format.Class();

      this.ram = new Uint8Array(65536);
      for (let i=0; i<65536; i++) {
         this.ram[i] = 0;
      }

      /*
      let start = 49152;
      let rom = fs.readFileSync('./Rom.bin');
      for (let i=0; i<rom.length; i++) {
         this.ram[start+i] = rom[i];
      }
      */

      //Start vector
      this.ram[65532] = 0;
      this.ram[65533] = 8;

      //Tiny Program
      this.ram[2048] = 230; //INC $00
      this.ram[2049] =   0;
      this.ram[2050] = 198; //DEC $01
      this.ram[2051] =   1;
      this.ram[2052] =  76; //JMP $0800
      this.ram[2053] =   0;
      this.ram[2054] =   8;
      
   }


   //---------------------------------------------------------------------------

   //
   // readAddress
   //
   readAddress(address) {
      return this.ram[address];
   }


   //
   // writeAddress
   //
   writeAddress(address, data) {
      this.ram[address] = data;
   }

   
   //---------------------------------------------------------------------------


   //
   // nextBank
   //
   nextBank() {

      this.renderAddress += this.bankSize;

      let limit = this.ram.length - this.bankSize;
      if (this.renderAddress > limit) {
         this.renderAddress = limit;
      }

   }


   //
   // previousBank
   //
   previousBank() {

      this.renderAddress -= this.bankSize;

      if (this.renderAddress < 0) {
         this.renderAddress = 0;
      }

   }


   //
   // nextPage
   //
   nextPage() {

      this.renderAddress += this.pageSize;

      let limit = this.ram.length - this.pageSize;
      if (this.renderAddress > limit) {
         this.renderAddress = limit;
      }

   }


   //
   // previousPage
   //
   previousPage() {

      this.renderAddress -= this.pageSize;

      if (this.renderAddress < 0) {
         this.renderAddress = 0;
      }

   }


   //---------------------------------------------------------------------------


   //
   // renderPage
   //
   renderPage() {

      let ansi = this.ansi;
      let format = this.format;
      let ram = this.ram;

      let a = this.renderAddress;
      let e = a + this.pageSize;

      for (; a<e; a+=16) {

         ansi.writeText('  ' + format.toHex(a,4) + ': ');

         for (let i=a; i<a+16; i++) {
            ansi.writeText(format.toHex(ram[i],2) + ' ');
         }

         for (let i=a; i<a+16; i++) {
            ansi.writeText(format.toVisibleChar(ram[i]));
         }

         ansi.writeLine('');

      }

   }

}
