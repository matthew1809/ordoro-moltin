## Setup
1. Add env vars for:
    - ORDORO_CLIENT_ID
    - ORDORO_CLIENT_SECRET
    - MOLTIN_CLIENT_ID
    - MOLTIN_CLIENT_SECRET

2. `npm i && serverless deploy`

## Usage
- Call POST `/orders/sync` in order to sync shipping statuses from Ordoro to Moltin
- Subscribe `order.created` webhook in Moltin to POST to `/orders/new` in order to send each new order to Ordoro


## TODO
- Only send paid orders from Moltin
- Sync inventory