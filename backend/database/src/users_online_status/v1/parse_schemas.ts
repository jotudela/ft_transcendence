const uosAdd = {
	type: 'object',
	properties: {
		status: {
			type: 'string',
			enum: ['online', 'offline', 'unknown'],
		},
	},
	required: ['status'],

};

const uosTargetedArray = {
	type: 'object',
	properties: {
		user_ids: {
			type: 'array',
			items: { type: 'number' },
		},
	},
	required: ['user_ids'],
};

export const uos_schemas = {
	uosAdd,
	uosTargetedArray,
};