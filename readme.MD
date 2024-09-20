# Zoho CRM Lead Management Project

This project enables managing leads in Zoho CRM using CRUD operations and generating a report of the actions performed.

## Requirements

- Node.js (v14 or higher)
- npm (v6 or higher)
- Zoho CRM account with API access

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tu_usuario/tu_repositorio.git
   cd tu_repositorio

2. **Install dependencies**
    ```bash
    npm install

3. **Set up environment variables.** Create a .env file at the root of the project and add the following variables:
    ```bash
    CLIENT_ID=1000.OCFCC0BX1L3W01ZCZ1NX8537SCRS5E
    CLIENT_SECRET=eb6eed781535816f999db9b0e8ff2d3399d700787b
    REDIRECT_URL=https://api-console.zoho.com/client/1000.OCFCC0BX1L3W01ZCZ1NX8537SCRS5E
    REFRESH_TOKEN=1000.5805b336d6415f3268310ed4cda2b4ec.f208255e99eceae38ef46ce755d42070
    BASE_URL=https://www.zohoapis.com/crm/v2

4. **Run the server**
    ```bash
    npm run dev

5. **Available Endpoints: You can also import the Postman collection found in the "postman" folder.**
    ```bash
    curl --location --request POST 'localhost:3000/createLeads'
    ```
    This endpoint filters the data from "leads.csv" and creates leads in the Zoho CRM API.

    ```bash
    curl --location --request PUT 'localhost:3000/updateLeads'
    ```

    This endpoint identifies leads with Lead_Source set to Advertisement and updates their Lead_Status to Contacted.

    Note: When querying newly created leads, Zoho CRM's API might return a 204 status if the leads were created less than a minute ago. In such cases, this endpoint will retry the request until a 200 status is received. This may increase the response time.

    ```bash
    curl --location --request DELETE 'localhost:3000/deleteLeads'
    ```

    This endpoint deletes all leads with Lead_Source set to Facebook.

    ```bash
    curl --location --request POST 'https://accounts.zoho.com/oauth/v2/token?grant_type=authorization_code&client_id=1000.OCFCC0BX1L3W01ZCZ1NX8537SCRS5E&client_secret=eb6eed781535816f999db9b0e8ff2d3399d700787b&redirect_uri=https%3A%2F%2Fapi-console.zoho.com%2Fclient%2F1000.OCFCC0BX1L3W01ZCZ1NX8537SCRS5E&code=1000.6b6da7141a24fbeff39c35a8b681dbb6.5a9561fa5a34995625a229598fab5f92' \
    --header 'Cookie: JSESSIONID=3D09280EF0CC25D267F34B5F63C1843A; _zcsr_tmp=4c9d221f-6b35-4c1f-8bdc-ac50ad2421c4; iamcsr=4c9d221f-6b35-4c1f-8bdc-ac50ad2421c4; zalb_b266a5bf57=a711b6da0e6cbadb5e254290f114a026; zalb_e188bc05fe=4d6e62173a764ac5410d1192f41034cd'
    ```

    Use this endpoint to generate the access_token and refresh_token from the grant_token.

    ```bash
        curl --location 'https://accounts.zoho.com/oauth/v2/token' \
    --header 'Cookie: JSESSIONID=3D09280EF0CC25D267F34B5F63C1843A; _zcsr_tmp=4c9d221f-6b35-4c1f-8bdc-ac50ad2421c4; iamcsr=4c9d221f-6b35-4c1f-8bdc-ac50ad2421c4; zalb_b266a5bf57=a711b6da0e6cbadb5e254290f114a026; zalb_e188bc05fe=4d6e62173a764ac5410d1192f41034cd' \
    --form 'grant_type="refresh_token"' \
    --form 'client_id="1000.OCFCC0BX1L3W01ZCZ1NX8537SCRS5E"' \
    --form 'client_secret="eb6eed781535816f999db9b0e8ff2d3399d700787b"' \
    --form 'redirect_uri="https://api-console.zoho.com/client/1000.OCFCC0BX1L3W01ZCZ1NX8537SCRS5E"' \
    --form 'refresh_token="1000.5805b336d6415f3268310ed4cda2b4ec.f208255e99eceae38ef46ce755d42070"'
    ```

    Use this endpoint to generate a new access_token using the refresh_token.

#### To generate the grant_token in Zoho CRM, follow the instructions here: https://www.zoho.com/crm/developer/docs/api/v5/auth-request.html#self-client

6. **Once the token is created, you need to generate the access_token and refresh_token. You can use the example in the Postman collection file (using my credentials).**
7. **Adjust the credentials in the .env file (for client_id, client_secret, redirect_uri, and code).**

## The project generates a report.csv file detailing:
    Total number of leads read from the CSV.
    Total number of leads created in Zoho CRM.
    Total number of leads updated.
    Total number of leads deleted.
