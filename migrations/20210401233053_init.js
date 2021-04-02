
exports.up = function (knex) {
    return knex.schema.createTable('users', table => {
        table.increments('id').primary();
        table.string('team_id');
        table.string('user_id');
        table.string('status');
        table.index(['team_id', 'user_id', 'status']);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('users');
};
