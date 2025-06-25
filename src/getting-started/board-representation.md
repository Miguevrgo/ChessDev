# Board Representation

When developing a chess program, an internal board representation is crucial. It's not just for enforcing game rules during play, but also for enabling the search algorithm to simulate moves. There are various approaches we'll discuss, but for now, we'll preview one key point: simply using a matrix of pieces isn't enough.

We also have to account for some information about the game such as the side to move, castling and en passant rights, etc. There are also lots of different chess board implementations within the same techniques we are going to see. It is up to the programmer to design their own approach with the data considered to make it faster while maintaining reliability or ease of use.

We'll now discuss some of the board representations, going first through bitboards which are the recommended way that almost all computer chess engines follow. If you don't yet understand why it's better, you can try experimenting with your own approach — it may even be better! However, if you just want something really good out of the box, trust the way, and we'll see together why it's a good idea, even if it's not the most space-efficient approach.

## Pieces

There are various ways to represent the pieces. It also depends on the programming language used. We will not go too much in depth on whether one design is better than another, because there are lots of alternatives each with their own advantages.

One thing to consider: try to make piece representations branchless and space-efficient when possible. We want to access piece types quite frequently. Although it's not the main bottleneck, we don't recommend an OOP approach with an inherited class for each type of piece.

There are 6 different types of pieces for each side, so 12 in total. Since one piece only occupies one square at a time, a Nil-piece aka empty square can be useful. For cheaper design, most engines prefer encoding the piece type and color as separate variables. The most straightforward way is using an enumeration.

### Enumeration

Enumerating piece types is fine. We often order them from least valuable to most.

#### C++

```cpp
enum PieceType {
    EMPTY, PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING,
};

enum Color {
    WHITE = 0,
    BLACK = 1
};

struct Piece {
    PieceType type;
    Color color;
};

```

#### Rust
```Rust
#[derive(Copy, Clone, PartialEq, Eq)]
pub enum PieceType {
    None,
    Pawn,
    Knight,
    Bishop,
    Rook,
    Queen,
    King,
}

#[derive(Copy, Clone, PartialEq, Eq)]
pub enum Color {
    White,
    Black,
}

#[derive(Copy, Clone)]
pub struct Piece {
    pub piece_type: PieceType,
    pub color: Color,
}
```
## Square
A square in chess refers to one of the 64 cells on a standard 8×8 board. Each square may be empty or occupied by a piece. In algebraic notation, squares are named using file (columns a to h) and rank (rows 1 to 8), such as e4 or a1.

Internally, it's common to number squares from 0 to 63. The most popular indexing scheme for bitboards is Little-Endian Rank-File (LERF) mapping, where:

- Square a1 is index 0 (LSB)
- Square h1 is index 7
- Square a2 is index 8
- ...
- Square h8 is index 63 (MSB)

This order matches how a 64-bit integer maps directly to the board, from least significant bit (LSB) to most significant bit (MSB), left to right, bottom to top.

A good reference to visualize this mapping: [Bitboard Viewer](https://tearth.dev/bitboard-viewer/)

## Board

### Bitboards

Bitboards are the standard and recommended way of representing a chess board in modern engines. While not the most space-efficient, they enable extremely fast operations using bitwise logic.
A bitboard is simply a 64-bit integer (`u64` in Rust, `uint64_t` in C++), where each bit corresponds to a square on the board. A bit set to 1 means the square is occupied; 0 means it's empty.

A natural question arises:
- **How do we know which piece is on each square if a bitboard only tells us if a square is occupied?**

There are multiple strategies:
- **[8 Bitboards]** One effective and compact approach is to use 8 bitboards in total:
    - 6 bitboards for each piece type (regardless of color):
    - 2 bitboards for side occupancy:

    With this setup, you can derive the full board state. For example, to get the bitboard of white pawns: `bitboards[pawn] | bitboards[white]`
    This design is compact and performant. It avoids redundant storage while still allowing fast queries, however, it is not the only possible
    approach:

- **[12 Bitboards]** One bitboard for each piece type and color, additionaly, some engines decide to use another 
  two bitboards for side occupancy.

- **[Hybrid approach]** Where we use the bitboards for fast operations + array of pieces for easier access for some operations, this involves
  a bigger size in the end, however, it can prove useful for many of the methods.

Let’s now see how we can implement a basic BitBoard in Rust. We'll define the most common bitboard operations and provide utility methods that are frequently used in chess engines. While there are many valid design choices, the implementation shown below balances clarity, efficiency, and usability.
**Key Operations:**
- Get bit: Check whether a square is set.
- Set bit: Mark a square as occupied.
- Pop bit: Clear a bit (e.g., when a piece moves).
- Count bits: Count how many squares are set (e.g., for population count or mobility).
- LSB: Find the least significant bit set (used for iterating over pieces).

We’ll also define a debug-friendly Display implementation for visualizing the bitboard.

#### C++

```cpp
enum class Square : std::uint8_t {
    A1 = 0, B1, C1, D1, E1, F1, G1, H1,
    A2, B2, C2, D2, E2, F2, G2, H2,
    A3, B3, C3, D3, E3, F3, G3, H3,
    A4, B4, C4, D4, E4, F4, G4, H4,
    A5, B5, C5, D5, E5, F5, G5, H5,
    A6, B6, C6, D6, E6, F6, G6, H6,
    A7, B7, C7, D7, E7, F7, G7, H7,
    A8, B8, C8, D8, E8, F8, G8, H8
};

constexpr std::uint8_t index(Square s) {
    return static_cast<std::uint8_t>(s);
}

class BitBoard {
public:
    constexpr BitBoard() : bits_(0) {}
    constexpr explicit BitBoard(std::uint64_t bits) : bits_(bits) {}

    [[nodiscard]] constexpr bool get_bit(Square sq) const {
        return bits_ & (1ULL << index(sq));
    }

        return BitBoard(bits_ | (1ULL << index(sq)));
    [[nodiscard]] constexpr BitBoard set_bit(Square sq) const {

    }
        return BitBoard(bits_ & ~(1ULL << index(sq)));
    [[nodiscard]] constexpr BitBoard pop_bit(Square sq) const {
    }

        return std::popcount(bits_);
    }

        return Square(std::countr_zero(bits_));
[[nodiscard]] constexpr int count_bits() const {
    }
[[nodiscard]] constexpr Square lsb() const {

    [[nodiscard]] std::string to_string() const {
        std::string result = "  a b c d e f g h\n ┌────────────────┐\n";
        for (int rank = 7; rank >= 0; --rank) {
            result += std::to_string(rank + 1) + "│";
            for (int file = 0; file < 8; ++file) {
                int idx = rank * 8 + file;
                bool bit = (bits_ >> idx) & 1;
                result += bit ? "1 " : "0 ";
            }
            result += "│\n";
        }
        result += " └────────────────┘\n";
        return result;
    }

    friend std::ostream& operator<<(std::ostream& os, const BitBoard& bb) {
    }
return os << bb.to_string();

private:
    std::uint64_t bits_;
};
```

```rust
struct BitBoard(u64);

impl BitBoard {
    pub fn get_bit(self, square: Square) -> bool {
        self.0 & (1u64 << square.index()) != 0
    }

    pub fn set_bit(self, square: Square) -> Self {
        Self(self.0 | (1u64 << square.index()))
    }

    pub fn pop_bit(self, square: Square) -> Self {
        Self(self.0 & !(1u64 << square.index()))
    }

    pub fn count_bits(self) -> u32 {
        self.0.count_ones()
    }

    pub fn lsb(self) -> Square {
        Square::new(self.0.trailing_zeros() as usize)
    }
}

/// Optional method which can be useful when debugging
impl std::fmt::Display for BitBoard {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        writeln!(f, "  a b c d e f g h")?;
        writeln!(f, " ┌────────────────┐")?;
        for rank in (0..8).rev() {
            write!(f, "{}│", rank + 1)?;
            for file in 0..8 {
                let index = rank * 8 + file;
                let bit = (self.0 >> index) & 1;
                write!(f, "{} ", if bit == 1 { "1" } else { "0" })?;
            }
            writeln!(f, "│")?;
        }
        writeln!(f, " └────────────────┘")
    }
}
```

**Notes**:
- Square is assumed to be a struct or enum with a method index() -> usize returning its 0–63 index.
- You can also implement your own version of count_ones (popcount) using techniques like the HAKMEM algorithm or lookup tables, though the built-in version is already highly optimized in modern CPUs.
- Advanced methods like pop_lsb() (clear and return index) and iteration over bits can also be added as needed.

#TODO: Include 10x12 boards, 0x88,etc

### Board State
As we have just seen, bitboards are great for representing piece positions, however, they are not enough to represent the full state of a chess game. We also have to track additional information inherent to the game, such as 
the side to move, castling rights, en passant square, time control, repetitions, etc. The prefered way to hold this information is to create a struct that contains all the necessary fields, as we can imagine, we are going to call it `Board`, although you can name it whatever you want (Position is quite common too).
Let's see an example of how we can represent the board state in Rust and C++ and then we will go through each field and its purpose.


#### C++
```cpp
struct Board {
    // We have already seen how we can represent the pieces,
    // Here we use the 12 bitboards approach
    std::array<BitBoard, 12> pieces;

    // Now the information about the game

    // Side to move (Color can be an enum {White, Black} or similar)
    Color side_to_move;

    // Castling rights stored in a compact way, using an u8 is fine for now
    CastlingRights castling_rights;

    // En passant square, if any
    std::optional<Square> en_passant_square;

    // Halfmoves
    // Chess is limited to less than 5900 moves, using 16 bits would be safer
    // (256 is a reasonable limit for most games but not all)
    uint8_t halfmoves = 0;

    // Hash (You can ingore this for now, we will see it quite later)
    ZobristHash hash;
};
```

#### Rust
```rust
struct Board {
    // We have already seen how we can represent the pieces,
    // Here we use the 8 bitboards approach + Piece map
    pieces: [BitBoard; 6],
    sides: [BitBoard; 2],

    // If we had defined empty pieces, we would not need Option<>
    piece_map: [Option<Piece>; Square::COUNT], // Square::COUNT is 64

    // Now the information about the game

    // Side to move (Color can be an enum {White, Black} or similar)
    side: Color,

    // Castling rights stored in a compact way, using an u8 is fine for now
    castling_rights: CastlingRights, // u8

    // En passant square, if any
    en_passant: Option<Square>,

    // Halfmoves
    // Chess is limited to less than 5900 moves, using u16 would be safer
    // (256 is a reasonable limit for most games but not all)
    halfmoves: u8,

    // Hash (You can ingore this for now, we will see it quite later)
    //hash: ZobristHash,
}
```

#### Sides
It is very useful to have a way to quickly check which side is to move, it could be computed from the halfmoves count, but it will 
be very handy to have it stored in the board, it also does not take much space, so we can use a simple data type which is able to hold
two values, such as an enum or a boolean. In the example above, we use an enum `Color` which can be either `White` or `Black`.

### CastlingRights
For us to generate legal moves, we have to follow the standard chess rules, which include castling rights, this includes tracking whether 
each side can castle kingside or queenside. We can use a simple `u8` to store this information, where each bit represents a castling right, this way, we can list
the four possible castling rights as follows:
- 0b0001: White can castle kingside
- 0b0010: White can castle queenside
- 0b0100: Black can castle kingside
- 0b1000: Black can castle queenside

Using this enconding, we can easily check whether a side can castle kingside, queenside or even both by using bitwise operations. For 
the real move generation, we will not just check the castling rights, but also the position of the king and rook, and whether the squares between them are empty or not, or if they are attacked by the opponent's pieces.
However, this is enough for now to represent the castling rights in a compact way, now, as usual, let's see how we can represent this in Rust and C++:

```cpp
#TODO
```

#### Rust
```rust
struct CastlingRights(u8);

impl CastlingRights {
    const WK: u8 = 0b0001; // White can castle kingside
    const WQ: u8 = 0b0010; // White can castle queenside
    const BK: u8 = 0b0100; // Black can castle kingside
    const BQ: u8 = 0b1000; // Black can castle queenside
    const ALL: u8 = Self::WK | Self::WQ | Self::BK | Self::BQ;
    const NONE: u8 = 0b0000; // No castling rights

    const fn index(self) -> usize {
        self.0 as usize
    }
}

```

### En Passant
There is a special rule in chess called en passant, which allows a pawn that has just moved two squares forward from its
starting position to be captured by an opponent's pawn as if it had only moved one square. To implement this rule, we have to track every time a 
pawn moves two squares forward, and we can do this by storing the square where the en passant capture can occur.

### Halfmoves
In game theory, it is quite common to notate the number of halfmoves made in a game, which means the number of turns made by both players.
This variable, which is often called `ply` in chess engines, represents the number of moves made by both players without a capture or a pawn move.
It is used to determine whether the 50-move rule applies, which states that if no capture or pawn move has been made in the last 50 moves, the game can be declared a draw.

### Hashing
We will not go deep into hashing yet as it is not necessary, however, its just a way to identify a board position by a number, this way we can use 
some advanced techniques such as transposition tables, which allow us to store previously computed positions and avoid recomputing them, we can also use it to detect repetitions and draw conditions.




