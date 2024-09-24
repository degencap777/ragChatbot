# Crypto-AI-RAG-Chatbot-Blockchain

![369724736-8c135801-f340-444b-abb6-d421a87d9053](https://github.com/user-attachments/assets/4eda4527-9acc-4af9-a925-bff5974c3d1c)

https://lucid.app/lucidchart/278e37f4-6cea-42e0-9077-590b51e790ad/edit?invitationId=inv_58843d40-76e4-48fa-9cef-139a245167d4&page=0_0#

## First step: building simple tool functions that can extract the key words from the user prompt.
## Next step: Extend the current tool functions for categories like `inscriptions on tx`, etc
![GXyALPUakAIoj3U](https://github.com/user-attachments/assets/39fa742c-6f30-450c-976e-92514136d72b)

## The way for extending is just adding more tool function.
## Next step: currently using `openai`, will change with `chain` or `agent`.
![GXqJM0GboAEmvu2](https://github.com/user-attachments/assets/22f6fe59-4803-4d30-b912-52a745e2692c)

## MVP that can extract the keywords and invoke relevant APIs.
![GXlrj3HbUAAF6yJ](https://github.com/user-attachments/assets/099b4104-4d7c-415f-8f2a-4b07844efb73)

## Test with some questions
```
Q: Find me all the details on token Billy from the list.
```
```
Q: What is the price of Popcat?
```
```
Q: Ok, so what is current volume of Popcat?
```
```
Q: Ok so how many holders does Popcat have?
```
```
Q: Is there more buying than selling of Popcat today?
```
```
Q: What is the CA?
```
```
Q: What is pair address?
```
```
Q: Buy me 100 SOL of PopCat.
```
