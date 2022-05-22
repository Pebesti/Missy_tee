create table garment(
	id serial not null primary key,
	description text,
	img text,
	season text,
	gender text,
	price decimal(10,2)
);

create table system_user(
	id serial not null primary key,
	first_name text,
	last_name text,
	password text,
	email text,
	username text,
	user_role text
);

create table cart(
	id serial not null primary key,
	user_id int,
	status text,
	foreign key (user_id) references system_user(id)
);

create table shopping_cart(
	id serial not null primary key,
	status text,
	cart_id int not null,
	garment_id int not null,
	qty int,
	foreign key (cart_id) references cart(id),
	foreign key (garment_id) references garment(id)
);