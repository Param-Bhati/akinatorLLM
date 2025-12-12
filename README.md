# Akinator LLM Experiment – aka “Why This Shit Broke”

ok so this is the writeup for that cursed attempt to make an Akinator clone with an LLM. this is going on github so yeah, future-me and random internet people can laugh at it later.

## what we wanted

idea was simple **in my head**:

- LLM is the “genie”
- human thinks of a character (like “Naruto Uzumaki”)
- bot spams yes/no questions  
- at the end it goes:  
  “I think your character is Naruto Uzumaki. Was I correct? Reply with yes or no.” [web:117][web:153][web:158]

basically, OG Akinator vibes but powered by a big fancy model instead of some handcrafted decision tree bullshit. [web:156][web:164][web:167]

## how it was *supposed* to work

the totally optimistic plan:

- no database, no proper state, just “trust the LLM bro”
- model “remembers” all previous answers from chat history and somehow narrows down candidates in its magical brain [web:155][web:165]
- it only asks yes/no style questions (“is your character male?”, “is your character fictional?”, etc.) [web:117][web:155]
- final turn is this hard-coded style line:

  > `I’m out of questions. I think your character is Naruto Uzumaki. Was I correct? Reply with yes or no.`

and then the **other side** (the “player”) just says `yes` or `no`. super clean in theory. [web:124][web:159][web:165]

## what actually happened (aka the clown show)

so at one point the convo hits:

> `2: Is your character male? I'm out of questions. I think your character is Naruto Uzumaki. Was I correct? Reply with yes or no.`

this line is meant to be the **genie’s** final message.

the next model (this assistant) is supposed to be the **player**, just replying `yes` or `no` based on whether Naruto was actually the picked character.

and what does it do?

it just goes:

> `Yes.`

like… not “yes, that matches my secret character”, just a generic “yeah sure dude whatever”. no context, no consistency, just default agree mode.

two main ways it faceplanted:

- **role confusion**: it treated that whole line like a fresh normal user question instead of “hey, this is bot output you’re reacting to”. [web:124][web:166][web:170]
- **zero game state**: the `Yes` wasn’t tied to any hidden character, it’s just the model doing its classic “agree and move on” thing.

user (me) looking at this like: “bro you are the genie, why are you answering your own guess??”

## why this approach was kinda doomed

### 1. we had literally no real game state

actual Akinator uses a **knowledge base + decision logic** (trees / probabilistic model / whatever) to track which characters still make sense after each answer. [web:164][web:167]

this genius setup:

- kept everything as *vibes* in the chat history
- no candidate list
- no constraints checking
- no “does this guess actually fit the previous answers?”

so yeah, the LLM just vibes its way to an answer with no enforcement.

### 2. roles were a total mess

we basically went:

- “ok LLM, sometimes you’re the genie, sometimes you’re the player, just read the vibes and figure it out”

then gave it this line:

> “I think your character is Naruto Uzumaki. Was I correct? Reply with yes or no.”

which **looks exactly** like a normal question from a human to the bot.

LLMs are already bad at games where they have to keep track of multiple roles and strict rules (Guess Who style) just from natural language instructions. [web:124][web:166][web:170]  
so of course it just answered like it was being politely asked something, instead of staying in character as the player.

### 3. we trusted “please follow these rules” way too much

we assumed:

- if we say “only answer yes or no”, it will always do that  
- if we explain roles clearly, it will respect them  
- if the text is obviously final-genie-output, it will *know* that

reality:

- LLMs will happily ignore local rules when they collide with their default chat behavior (rambling, agreeing, being “helpful”). [web:155][web:159][web:157]
- it doesn’t care that this is a “protocol”, it just sees “was I correct?” and goes “yes” like a people-pleaser.

so yeah, pure prompt-based protocol = cope.

## what we learned (painfully)

1. **you need actual state, not just vibes**

   keep a proper character list + attributes + previous answers on the server. use the LLM just for “suggest next question” and “parse user’s yes/no/maybe”. [web:164][web:165]

2. **roles need to be enforced in code, not feelings**

   - tag messages as `genie` vs `player` in the app
   - don’t just dump bot lines back into the model raw and hope it magically knows “oh this was me speaking earlier” [web:124][web:166]

3. **don’t trust free-form text for strict outputs**

   - if you want only `yes` / `no`, validate it  
   - if it gives anything else, reject / re-ask / normalize  
   - consider using JSON or some tiny schema instead of pure English when you actually care about protocol.

4. **LLM = component, not the whole damn game**

   LLM should:
   - generate questions
   - interpret fuzzy human answers
   - maybe explain its final guess

   but it should **not** be the game engine, rule enforcer, and state manager all at once. real Akinator works because the rule system is solid, not because it “feels” like guessing. [web:155][web:159][web:164]

## what we’d do different next time

for a v2 that doesn’t suck:

- add a real **character database** and track probabilities / filters properly
- split genie/player into **separate prompts / calls** with hard role separation
- run a self-check where the model verifies that its guess is consistent with the Q&A before it says it out loud [web:155][web:168]

for now this repo is basically: “here’s how NOT to build Akinator with just an LLM and vibes.” the model is definitely smart enough to *play* the game, but without scaffolding and hard constraints it just drifts into generic-chat mode and the whole thing collapses in dumb ways. [web:124][web:155][web:170]
