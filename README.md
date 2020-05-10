# RAMulator

**rework this dscription text**

A 'RAM emulator' running under Node.js on a Raspberry Pi connected via GPIO to a W65C02S CPU

Generally, people start with clock generation, RAM, and EEPROM logic to get a 6502 up and running.  I wanted to
get going faster, so being a programmer, it was easier to use a RPi and some code to create a low freq clock
as well as emulate memory for data read/write by the CPU.  This makes it very fast to update my 'rom' by simply
replacing the ROM.bin file - and makes it easy to see code execution visually before I have an IO system in
place.  The downside is the RPi is 3.3v instead of 5v.


## Address Bus

The sixteen W65C02S address lines are connected to the Raspberry Pi GPIO pins as shown below:

| CPU Address Bus |  A0 |  A1 |  A2 |  A3 |  A4 |  A5 |  A6 |  A7 |  A8 |  A9 | A10 | A11 | A12 | A13 | A14 | A15 |
| --------------- |:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| CPU Pin         |  9  |  10 |  11 |  12 |  13 |  14 |  15 |  16 |  17 |  18 |  19 |  20 |  22 |  23 |  24 |  25 |
| RPi Pin         |  7  |  8  |  10 |  11 |  12 |  13 |  15 |  16 |  18 |  19 |  21 |  22 |  23 |  24 |  26 |  29 |


## Data Bus

The eight W65C02S data lines are connected to the Raspberry Pi GPIO pins as shown below:

| CPU Data Bus    |  D0 |  D1 |  D2 |  D3 |  D4 |  D5 |  D6 |  D7 |
| --------------- |:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| CPU Pin         |  33 |  32 |  31 |  30 |  29 |  28 |  27 |  26 |
| RPi Pin         |  31 |  32 |  33 |  35 |  36 |  37 |  38 |  40 |


## Remaining Pins

The remaining W65C02S pins are connected to the Raspberry Pi GPIO pins as shown below:

| CPU             | RDY | IRQB | NMIB | VDD | VSS | RWB | BE | PHI2 | SOB | RESB |
| --------------- |:---:|:----:|:----:|:---:|:---:|:---:|:--:|:----:|:---:|:----:|
| CPU Pin         |  2  |   4  |   6  |  8  |  21 |  34 | 36 |  37  |  38 |  40  |
| RPi Pin         |  17 |  17  |  17  |  17 |  20 |  5  | 17 |   3  |  17 |  17  |
