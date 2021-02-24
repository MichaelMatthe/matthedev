# server emits

-   connect
-   joinLobby

```javascript
{
    lobbyId: String;
    players: [];
}
```

-   playerJoinsLobby
    -   name: String
-   startGame
    -   players: []
-   playerSubmittedAnswer
    -   player: String

# client emits

-   joinLobby
    -   name: String
    -   lobbyId: String
-   createLobby
    -   name: String
-   startGame
    -   lobbyId: String
-   submitAnswer
    -   image: String
    -   guess: String
