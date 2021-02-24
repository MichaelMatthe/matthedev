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

-   submitAnswer

```javascript
{
    image: String,
    guess: String,
}
```
