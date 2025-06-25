# Move Generation

If you have completed and read the Board tutorial, you should have a basic understanding of how to represent a chess board and pieces in code. Now, we will implement the move generation logic for our engine.
There are many different ways to implement move generation, here, we will discuss many and so it is up to you to choose the one that fits your needs best or you understand best.

This implementation heavily depends on the board representation, as it is quite the standard to use bitboards, we will assume you are using them as well, however, if you are not, I hope you can still follow along and adapt the code to your needs.
Either way, move generation is the part of the board implementation which is going to take the most time while searching, coding, and debugging, so it is important to get it right. We will later discuss how to check whether or not 
your engine is generating the correct moves, however, if you follow the code examples and the explanations, you should be able to implement a working move generation logic.

## Legality

There are two main approaches to move generation: generating all legal moves and generating pseudo-legal moves for later check.

### Pseudo-legal moves
In pseudo-legal move generation, we generate all moves which are possible according to the movement rules of each piece,
without checking whether or not the move would leave the king in check. This is the most common approach and is usually faster
than generating legal moves, as it does not require checking for checks after each move.

### Legal moves
In legal move generation, we generate only moves which do not leave the king in check.
This is usually slower than generating pseudo-legal moves, as it requires checking for checks after each move.

Either way, pins, en passant and castling will be the hardests parts to get right.

## Standard moves
Standard moves don’t require much explanation or advanced techniques. The real challenge lies in the special moves mentioned earlier and optimizing sliding piece attack generation.

We’ll focus this section on those special and performance-critical moves, but first, let’s implement the basic move representation.
We need a way to store information about each move. While some engines store additional data to assist in move sorting or other heuristics, we'll stick to what is strictly necessary:

We need to store:

- Origin square (2^6 = 64 positions so we will need 6 bits)
- Destination square (2^6 = 64 positions so we will need 6 bits)
- Type of Move

For the move type, we will use 4 bits:
- 2 bits to describe the kind of move (quiet, capture, castling, etc.)
- 2 additional bits for promotions (Queen, Knight, Rook, Bishop)

We could have used a 3-bit encoding for all 8 special cases (castling, en passant, 4 promotion types),
but since the compiler will likely align the Move struct to 16 bits anyway, this bit allocation makes it
easier to distinguish between move categories quickly.

Let's now implement the Move struct:


#### C++
```cpp
#TODO:
```

#### Rust
```rust

#[repr(u8)]
#[derive(Copy, Clone, PartialEq, Eq, PartialOrd, Debug, Hash)]
pub enum MoveKind {
    Quiet = 0b0000,
    Castle = 0b0001,
    DoublePush = 0b0010,

    // Promotions have 3rd bit set
    KnightPromotion = 0b0100,
    BishopPromotion = 0b0101,
    RookPromotion = 0b0110,
    QueenPromotion = 0b0111,

    // Captures have 4th bit set
    Capture = 0b1000,
    EnPassant = 0b1001,

    KnightCapPromo = 0b1100,
    BishopCapPromo = 0b1101,
    RookCapPromo = 0b1110,
    QueenCapPromo = 0b1111,
}

pub struct Move(pub u16);

impl Move {
    pub fn new(src: Square, dest: Square, kind: MoveKind) -> Self {
        Self((src.index() as u16) | ((dest.index() as u16) << 6) | ((kind as u16) << 12))
    }

    pub fn get_source(self) -> Square {
        Square::new((self.0 & SRC) as usize)
    }

    pub fn get_dest(self) -> Square {
        Square::new(((self.0 & DST) >> 6) as usize)
    }

    pub fn get_type(self) -> MoveKind {
        match (self.0 & TYPE) >> 12 {
            0b0000 => MoveKind::Quiet,
            0b0001 => MoveKind::Castle,
            0b0010 => MoveKind::DoublePush,
            0b1000 => MoveKind::Capture,
            0b1001 => MoveKind::EnPassant,

            0b0100 => MoveKind::KnightPromotion,
            0b0101 => MoveKind::BishopPromotion,
            0b0110 => MoveKind::RookPromotion,
            0b0111 => MoveKind::QueenPromotion,

            0b1100 => MoveKind::KnightCapPromo,
            0b1101 => MoveKind::BishopCapPromo,
            0b1110 => MoveKind::RookCapPromo,
            0b1111 => MoveKind::QueenCapPromo,

            _ => unreachable!(),
        }
    }
}

impl std::fmt::Display for Move {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = format!("{}{}", self.get_source(), self.get_dest());
        let move_type = self.get_type();

        if move_type.is_promotion() {
            write!(
                f,
                "{}{}",
                s,
                move_type.get_promotion(Colour::Black).to_char()
            )
        } else {
            write!(f, "{s}")
        }
    }
}
```

As you can see, we have also defined a MoveKind struct to represent the 4 bits which we are using for move type,
the order provided before allows us to get the information we need by simply shifting the Move some positions.
There is also an unnecessary display implementation which comes very handy when debugging. Now that we have succesfully implemented
a struct for our moves, we are going to generate them, this time, we will go back to where we defined the board and lets 
see how we can generate the easier moves, as we said, we are firstly going to generate all the possible moves and then we will filter
the ones which are completely legal, lets implement in a board method (lets call it pseudo_gen for example) the moves for all types 
of pieces, of course, we are just generating for the current color pieces so the first thing will be getting the side.

#### Pawns
As we know, pawns are able to go forward 1 square (2 if they are in starting position) and to capture one square to their front diagonals,
additionally, they have the en passant rule, which as we said, allows us to move diagonally even though we have a pawn on our side if that
pawn moved two squares forward the last turn.

To get all pawn movements, we will first have to identify where all paws are, then, we will iterate each one pushing its possible moves to a
handy structure, you can use an array, a vector or whatever you consider best, however, a vector seems the most reasonable:


#### C++

```cpp
// auto Board::generate_pseudo_moves(Colour side) -> std::vector<Move>
std::size_t side_idx = side as usize;
BitBoard pawn_bb = pieces[Piece::WP.index()] & self.sides[side_idx];

// Now we iterate over all pawns
//TODO
```


#### Rust
```rust

/// fn generate_pseudo_moves(&self, side: Colour) -> Vec<Move>
    let mut moves = Vec::with_capacity(64);
    let side_idx = side as usize;

    // Now we iterate over all pawns
    let mut pawn_bb = self.pieces[Piece::WP.index()] & self.sides[side_idx];
    while pawn_bb != BitBoard::EMPTY {
        let src = pawn_bb.lsb(); // Least significant Byte
        moves.extend(all_pawn_moves(
            src,
            if side == Colour::White {
                Piece::WP
            } else {
                Piece::BP
            },
            self,
        )); // Pushing each possible move for the current pawn
        pawn_bb = pawn_bb.pop_bit(src);
    }

/// pub fn all_pawn_moves(src: Square, piece: Piece, board: &Board) -> Vec<Move>
    let mut moves = Vec::new();
    let forward = piece.colour().forward(); // +1 | -1 Depending on color

    let start_rank = BitBoard::START_RANKS[piece.colour() as usize]; // Starting rank bitboard (1s in 2|7 row)
    let promo_rank = BitBoard::PROMO_RANKS[piece.colour() as usize]; // Promotion rank bitboard
    let opponent = board.sides[!piece.colour() as usize];

    // If our move dest is promo rank, we are pushing all kinds of promotions
    if let Some(dest) = src.jump(0, forward) {
        if promo_rank.get_bit(dest) {
            moves.push(Move::new(src, dest, MoveKind::QueenPromotion));
            moves.push(Move::new(src, dest, MoveKind::RookPromotion));
            moves.push(Move::new(src, dest, MoveKind::BishopPromotion));
            moves.push(Move::new(src, dest, MoveKind::KnightPromotion));
        } else {
            // If it is not a promotion, it is not either a capture so quiet move
            moves.push(Move::new(src, dest, MoveKind::Quiet));
        }
    }

    // Starting row is able to advance two squares
    if start_rank.get_bit(src) {
        moves.push(Move::new(
            src,
            src.jump(0, 2 * forward).unwrap(),
            MoveKind::DoublePush,
        ));
    }

    // Diagonal checking (capture)
    for delta in [(-1, forward), (1, forward)] {
        if let Some(dest) = src.jump(delta.0, delta.1) {
            if opponent.get_bit(dest) {
                if promo_rank.get_bit(dest) { // A capture + Promotion is possible
                    moves.push(Move::new(src, dest, MoveKind::QueenCapPromo));
                    moves.push(Move::new(src, dest, MoveKind::RookCapPromo));
                    moves.push(Move::new(src, dest, MoveKind::BishopCapPromo));
                    moves.push(Move::new(src, dest, MoveKind::KnightCapPromo));
                } else {
                    moves.push(Move::new(src, dest, MoveKind::Capture));
                }
            } else if board.en_passant == Some(dest) { // If an en_passant can be made in the diagonal
                let ep_target = dest.jump(0, -forward).expect("Invalid en passant target");
                if opponent.get_bit(ep_target) {
                    moves.push(Move::new(src, dest, MoveKind::EnPassant));
                }
            }
        }
    }
    moves
}
```
