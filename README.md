# Twitch + Youtube Music Bot Integration
Self hosted twitch bot that adds songs into a queue on the [Pear Desktop](https://github.com/pear-devs/pear-desktop) YouTube Music App
* DOES NOT WORK WITH MIXES, RADIOS, AUTOMATIC PLAYING(?)
------------
## SETUP
**Requirements**:
* Two twitch accounts are recommended for use: Main Account, Account with which the bot will type through <sub>(bot account)</sub>
  * It is also possible to use your main account as the chat bot (I will refer to the used account as 'bot account' onward)
* Create a developer application on [Twitch Developers](https://dev.twitch.tv)
* __Nodejs__ and __Twitch CLI__ <sub>(Nodejs allows the js file to be ran and Twitch CLI generates the necessary tokens for the bot)</sub>

  * Rather than installing Twitch CLI, [twitchtokengen](https://twitchtokengenerator.com/) may also be used to gather tokens, then scoop can be skipped and nodejs can be [manually installed](#manual)

### There are two methods in getting the needed installations, <ins>Scoop</ins> and <ins>Manual Install</ins>,

[Scoop](https://scoop.sh/):
---------
* Open command prompt and run:
```
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```
 * Install Twitch CLI via scoop:
 ```
 scoop bucket add twitch https://github.com/twitchdev/scoop-bucket.git
scoop install twitch-cli
```
 * Install nodejs via scoop:
 ```
 scoop install nodejs-lts
 ```

 __Manual:__
-----------------

 * Download [nodejs](https://nodejs.org/en/download/current)
 * Download [TwitchCLI](https://github.com/twitchdev/twitch-cli)

-------------
  
## Instructions

**Getting Twitch Tokens**
* Head to [Twitch Developers](https://dev.twitch.tv),
  1. Create an application and register the name as anything you would like
  3. Set the OAuth URL as "https://twitchtokengenerator.com/oauth/callback" if using twitch token generator,\
    for CLI add urls https://localhost:3000 , http://localhost:3000 , https://localhost (for safe measure :) )
  4. Set the category as 'Chat Bot'
  5. Click create then click manage on the new application
  6. Click 'New Secret' and place both the 'Client ID' and 'Client Secret' somewhere safe for later use 
 
Using [twitchtokengenerator](https://twitchtokengenerator.com/),
* To use twitch token generator
  *  log into the 'bot account' and paste the 'Client ID' and 'Client Secret' into their boxes
  *  Under 'Available Token Scopes', select the following twitch scopes: "user:bot user:read:chat user:write:chat"
  *  Scroll down the page and click 'Generate Token', authorize, captcha
  *  Copy the 'Access Token' and 'Refresh Token' and place them somewhere safe
 
Using Twitch CLI
* To use Twitch CLI,
  * Open command prompt and type 'twitch configure'
  * Paste required information (Client ID then Client Secret) [**Paste by right clicking in window**]
  * Paste command (twitch token -u -s "user:bot user:read:chat user:write:chat")
    * Ensure it is opening with 'bot account' logged into the browser
    * If you receive errors, you can manually login by using the command (twitch token -u --dcf -s "user:bot user:read:chat user:write:chat")

