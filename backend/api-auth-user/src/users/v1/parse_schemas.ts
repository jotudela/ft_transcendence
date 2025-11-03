export const usersCreateSchema = {
    type: 'object',
    required: ['username', 'password', 'email'],
    properties: {
        username: {
            type: 'string',
            minLength: 3,
            maxLength: 20
        },
        password: {
            type: "string",
            minLength: 8,
            maxLength: 64,
            pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"
            // Variante plus stricte si besoin :
            // pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).+$"
        },
        email: {
            type: "string",
            format: "email",
            minLength: 5,
            maxLength: 254
        },
        username_in_tournaments: {
            type: 'string',
            minLength: 3,
            maxLength: 20
        }
    }
};

export const usersTryToLog = {
    type: 'object',
    required: ['email', 'password'],
    properties: {
        email: {
            type: "string",
            minLength: 5,
            maxLength: 254
        },
        password: {
            type: "string",
            minLength: 8,
            maxLength: 64,
            pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"
        }
    }
};