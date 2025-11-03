const userIdParamSchema = {
	type: 'object',
	properties: {
		user_id: { type: 'string', pattern: '^[0-9]+$' }
	},
	required: ['user_id']
};

const idParamSchema = {
	type: 'object',
	properties: {
		id: { type: 'string', pattern: '^[0-9]+$' }
	},
	required: ['id']
};

export const global_schemas = {
	userIdParamSchema,
	idParamSchema
};