const friendRequestCreateSchema = {
    type: 'object',
    required: ['user_id_1', 'user_id_2', 'requested_by'],
    properties: {
        user_id_1: { type: 'integer', minimum: 1 },
        user_id_2: { type: 'integer', minimum: 1 },
        requested_by: { type: 'integer', minimum: 1 },
    },
};

const friendRequestUpdateSchema = {
    type: 'object',
    required: ['id', 'status'],
    properties: {
        id: { type: 'integer' },
        status: { type: 'string', enum: ['accepted', 'rejected'] },
    },
};

const friendRequestDeleteSchema = {
    type: 'object',
    required: ['user_id_1', 'user_id_2'],
    properties: {
        user_id_1: { type: 'integer' },
        user_id_2: { type: 'integer' },
    },
};

export const friends_schemas = {
    friendRequestCreateSchema,
    friendRequestUpdateSchema,
    friendRequestDeleteSchema,
};