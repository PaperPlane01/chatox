create table if not exists oauth_client_token (
  token_id VARCHAR(256),
  token bytea,
  authentication_id VARCHAR(256),
  user_name VARCHAR(256),
  client_id VARCHAR(256)
);

create table if not exists oauth_access_token (
  token_id VARCHAR(256),
  token bytea,
  authentication_id VARCHAR(256),
  user_name VARCHAR(256),
  client_id VARCHAR(256),
  authentication bytea,
  refresh_token VARCHAR(256)
);

create table if not exists oauth_refresh_token (
  token_id VARCHAR(256),
  token bytea,
  authentication bytea
);

create table if not exists oauth_code (
  code VARCHAR(256), authentication bytea
);

create table if not exists oauth_approvals (
  userId VARCHAR(256),
  clientId VARCHAR(256),
  scope VARCHAR(256),
  status VARCHAR(10),
  expiresAt TIMESTAMP,
  lastModifiedAt TIMESTAMP
);

INSERT INTO public.account(id, enabled, locked, password_hash, type, username, user_ids) VALUES ('092a350e-b686-4ba3-97dd-417a207b2c3c', true, false, '$2a$12$TNbUx13Y7lMHfZ09cwXCHOfi7oDKUET8ZBstH8VGjqCHVB5ne5wuC', 'USERNAME_AND_PASSWORD', 'admin', '["17d6b568-af13-470d-88fb-8b982a5dcadf"]');

--
-- TOC entry 2916 (class 0 OID 1142933)
-- Dependencies: 209
-- Data for Name: user_role; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.user_role VALUES ('06c3d9bc-fc2e-485d-8d78-a645db9ad5c2', 'ROLE_USER');
INSERT INTO public.user_role VALUES ('ef5fdbd9-a32d-4395-9732-a3fb378590ea', 'ROLE_ANONYMOUS_USER');
INSERT INTO public.user_role VALUES ('a654314b-ede3-4c06-a461-edcdb84be13c', 'ROLE_ADMIN');


--
-- TOC entry 2910 (class 0 OID 1142891)
-- Dependencies: 203
-- Data for Name: account_to_role; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.account_to_role VALUES ('092a350e-b686-4ba3-97dd-417a207b2c3c', '06c3d9bc-fc2e-485d-8d78-a645db9ad5c2');
INSERT INTO public.account_to_role VALUES ('092a350e-b686-4ba3-97dd-417a207b2c3c', 'a654314b-ede3-4c06-a461-edcdb84be13c');

--
-- TOC entry 2911 (class 0 OID 1142897)
-- Dependencies: 204
-- Data for Name: authorized_grant_type; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.authorized_grant_type VALUES ('5bf97822-6f11-401c-b083-92a8008312f3', 'client_credentials');
INSERT INTO public.authorized_grant_type VALUES ('f8a77ba6-8bcd-4a13-ba82-e3a5ddfc2985', 'password');


--
-- TOC entry 2912 (class 0 OID 1142905)
-- Dependencies: 205
-- Data for Name: client; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.client VALUES ('744dcae8-56a6-4d19-8e05-f626be898131', 3600, true, '2019-09-28 22:06:32.412903', true, 'Chatox React client', NULL, 31557600, '$2a$12$J6sVdaoFn1UI17CPSU1e8OuoMPlzvFjpBsvM6g/uCBz4Z5mLUCdg.', '092a350e-b686-4ba3-97dd-417a207b2c3c');
INSERT INTO public.client VALUES ('9e6f556f-0321-4b11-b6b0-ddb7da2ead16', 3600, true, '2019-09-28 22:07:00.842009', true, 'Registration Service', NULL, 31557600, '$2a$12$J6sVdaoFn1UI17CPSU1e8OuoMPlzvFjpBsvM6g/uCBz4Z5mLUCdg.', '092a350e-b686-4ba3-97dd-417a207b2c3c');


--
-- TOC entry 2913 (class 0 OID 1142913)
-- Dependencies: 206
-- Data for Name: client_to_authorized_grant_type; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.client_to_authorized_grant_type VALUES ('9e6f556f-0321-4b11-b6b0-ddb7da2ead16', '5bf97822-6f11-401c-b083-92a8008312f3');
INSERT INTO public.client_to_authorized_grant_type VALUES ('744dcae8-56a6-4d19-8e05-f626be898131', 'f8a77ba6-8bcd-4a13-ba82-e3a5ddfc2985');


--
-- TOC entry 2915 (class 0 OID 1142925)
-- Dependencies: 208
-- Data for Name: scope; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.scope VALUES ('fde1d383-504e-4b96-a23b-aeeefed8dc55', 'internal_create_user');
INSERT INTO public.scope VALUES ('1d55ccd8-8f90-44ce-918f-f7cb3bc15391', 'internal_create_account');
INSERT INTO public.scope VALUES ('5da1d850-cf4b-49e1-b24b-a8566a3e05af', 'internal_update_account');
INSERT INTO public.scope VALUES ('2d5315f8-e141-4a18-991e-c6d61f63486d', 'all');


--
-- TOC entry 2914 (class 0 OID 1142919)
-- Dependencies: 207
-- Data for Name: client_to_scope; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.client_to_scope VALUES ('9e6f556f-0321-4b11-b6b0-ddb7da2ead16', '1d55ccd8-8f90-44ce-918f-f7cb3bc15391');
INSERT INTO public.client_to_scope VALUES ('9e6f556f-0321-4b11-b6b0-ddb7da2ead16', 'fde1d383-504e-4b96-a23b-aeeefed8dc55');
INSERT INTO public.client_to_scope VALUES ('9e6f556f-0321-4b11-b6b0-ddb7da2ead16', '5da1d850-cf4b-49e1-b24b-a8566a3e05af');
INSERT INTO public.client_to_scope VALUES ('744dcae8-56a6-4d19-8e05-f626be898131', '2d5315f8-e141-4a18-991e-c6d61f63486d');
