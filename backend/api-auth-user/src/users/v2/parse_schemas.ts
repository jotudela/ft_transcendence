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
            pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).+$"
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
        },
        sub: {
            type: 'string'
        }
    }
};

export const usersUpdateSchema = {
    type: 'object',
    required: [],
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
            pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).+$"
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
        },
        sub: {
            type: 'string'
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
            pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).+$"
        }
    }
};

const schemaFriends = {
    type: 'object',
    required: ['user_id_1', 'user_id_2', 'requested_by'],
    properties: {
        user_id_1: { type: "number" },
        user_id_2: { type: "number" },
        requested_by: { type: "number" }
    }
};

const updateStatusFriends = {
    type: 'object',
    required: ['id', 'status'],
    properties: {
        id: { type: "number" },
        status: { type: 'string', enum: ['accepted', 'rejected'] }
    }
};

const schemaDeleteFriends = {
    type: 'object',
    required: ['user_id_1', 'user_id_2'],
    properties: {
        user_id_1: { type: 'number' },
        user_id_2: { type: 'number' }
    }
};

export const friends = {
    schemaFriends,
    updateStatusFriends,
    schemaDeleteFriends
}