# server emits

-   connect
-   joinLobby

```javascript
{
    lobbyId: String,
    players: [],
}
```

-   playerJoinsLobby

```javascript
{
    name: String,
}
```

-   startGame

```javascript
{
    players: [],
}
```

-   playerSubmittedAnswer

```javascript
{
    player: String,
}
```

-   playerJoinsLobby

```javascript
{
    name: String,
}
```

-   startDrawRound

```javascript
{
    word: String,
    round: number,
}
```

-   startGuessRound

```javascript
{
    image: String,
    round: number,
}
```

# client emits

-   joinLobby

```javascript
{
    name: String,
    lobbyId: String,
}
```

-   createLobby

```javascript
{
    name: String,
}
```

-   startGame

```javascript
{
    lobbyId: String,
}
```

-   submitDrawing

```javascript
{
    player: String,
    lobbyId: String,
    image: String,
}
```

-   submitGuess

```javascript
{
    player: String,
    lobbyId: String,
    word: String,
}
```
