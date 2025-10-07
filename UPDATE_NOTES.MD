## Registration Page
Add A Response Handler For the form
1. Split Username and Email duplicate account request setup
2. That create some more UX Form Validation errors on this form (I.e. Duplicate Username, Duplicate Email)
3. Lets remove First Name and Last Name , these can be optional for now for Registration.
4. Reformat the form (I might be able to do this)
Look into the setup for Google Authentication for user login instead.
1. Users here get a randomized username and immediately prompted to update it if they want to. (After successful google Authentication)


## Login Allow Username and Password
Allow for using either your email OR username for Sign In
1. Doug - Remove "or continue with" and the other "Login Methods" 
Setup SFTP for Email Authentication
1. I will gather the information for our "noreply" email and add it to the .env file.
Work on getting the Forget Password up with SFTP Service

-- Intitial build question-response #1 - 9/9/2025

Questions:
1. Priority Order - Which of these would you like to tackle first? The registration improvements or the login flexibility?
2. Google OAuth - Do you have Google OAuth credentials set up already, or do we need to configure those first?
3. Current State - Should I first examine the current registration and login components to understand the existing implementation?
4. SMTP Service - Are you planning to use a specific email service (Gmail, SendGrid, etc.) for the SMTP setup?
5. Username Generation - For Google auth users, do you want the randomized username to follow a specific pattern (e.g., "user_12345", "gamer_abc123")?

Respoonses:
1. Simplify registration fields/update login UI, Better error message for duplicates, then we will work on the forget password/email stuff, and finally we will finish up with google authentication. 
2. I will setup google oauth credentials when ready. Looking into it now.
3. Yes please do , when we get to other levels of the application I will add more context for you. 
## RULE:
We will update the RAGAR_BACKEND.md as we work on this project as a project functionality and "current state" document
4. I will add another service later, for now I have a regular cpanel server email I can use for basic SMTP.
5. Perfect yes! Use a randomized array prefix pattern for gaming terms. Then use 6-9 alphanumeric characters and join with the underscore.
Some Gaming names should be include: gamer, warrior, guardian, healer, sorcerer, knight, fighter, wizard