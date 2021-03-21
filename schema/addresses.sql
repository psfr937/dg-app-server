--
-- PostgreSQL database dump
--

-- Dumped from database version 12.5
-- Dumped by pg_dump version 12.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: inventories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventories (id, name, brand, gender, size, description, created_at, updated_at, seller_id, picture_url, price, sold, brand_id) FROM stdin;
52	\N	Lanvin	\N	\N	\N	2021-03-17 12:47:33.516149+08	2021-03-17 12:47:33.516149+08	\N	\N	400000	f	\N
51	\N	haha	\N	\N	\N	2021-03-17 11:08:15.862073+08	2021-03-17 11:08:15.862073+08	\N	\N	500	f	\N
4	skirt	\N	\N	\N	Good skirt	2021-02-18 17:42:53.923484+08	2021-02-18 17:42:53.923484+08	\N	https://marketing-image-production.s3.amazonaws.com/uploads/8dda1131320a6d978b515cc04ed479df259a458d5d45d58b6b381cae0bf9588113e80ef912f69e8c4cc1ef1a0297e8eefdb7b270064cc046b79a44e21b811802.png	10000	f	\N
3	skirt	\N	\N	\N	Good skirt	2021-02-18 17:42:53.923484+08	2021-02-18 17:42:53.923484+08	\N	https://marketing-image-production.s3.amazonaws.com/uploads/8dda1131320a6d978b515cc04ed479df259a458d5d45d58b6b381cae0bf9588113e80ef912f69e8c4cc1ef1a0297e8eefdb7b270064cc046b79a44e21b811802.png	10000	f	\N
1	skirt	CKA	\N	42	Good skirt	2021-02-18 17:42:53.923484+08	2021-02-18 17:42:53.923484+08	\N	https://marketing-image-production.s3.amazonaws.com/uploads/8dda1131320a6d978b515cc04ed479df259a458d5d45d58b6b381cae0bf9588113e80ef912f69e8c4cc1ef1a0297e8eefdb7b270064cc046b79a44e21b811802.png	20000	t	2
5	skirt	\N	\N	\N	Good skirt	2021-02-18 17:42:53.923484+08	2021-02-18 17:42:53.923484+08	\N	https://i.imgur.com/4eair9X.jpeg	10000	f	\N
6	skirt	\N	\N	\N	Good skirt	2021-02-18 17:42:53.923484+08	2021-02-18 17:42:53.923484+08	\N	https://i.imgur.com/4eair9X.jpeg	10000	f	\N
7	skirt	\N	\N	\N	Good skirt	2021-02-18 17:42:53.923484+08	2021-02-18 17:42:53.923484+08	\N	https://i.imgur.com/4eair9X.jpeg	10000	f	\N
8	skirt	\N	\N	\N	Good skirt	2021-02-18 17:42:53.923484+08	2021-02-18 17:42:53.923484+08	\N	https://i.imgur.com/4eair9X.jpeg	10000	f	\N
9	skirt	\N	\N	\N	Good skirt	2021-02-18 17:42:53.923484+08	2021-02-18 17:42:53.923484+08	\N	https://i.imgur.com/4eair9X.jpeg	10000	f	\N
10	skirt	\N	\N	\N	Good skirt	2021-02-18 17:42:53.923484+08	2021-02-18 17:42:53.923484+08	\N	https://i.imgur.com/4eair9X.jpeg	10000	f	\N
11	skirt	\N	\N	\N	Good skirt	2021-02-18 17:42:53.923484+08	2021-02-18 17:42:53.923484+08	\N	https://i.imgur.com/4eair9X.jpeg	10000	f	\N
12	skirt	\N	\N	\N	Good skirt	2021-02-18 17:42:53.923484+08	2021-02-18 17:42:53.923484+08	\N	https://i.imgur.com/4eair9X.jpeg	10000	f	\N
13	skirt	\N	\N	\N	Good skirt	2021-02-18 17:42:53.923484+08	2021-02-18 17:42:53.923484+08	\N	https://i.imgur.com/4eair9X.jpeg	10000	f	\N
49	skirt	\N	\N	\N	Good skirt	2021-02-18 17:42:53.923484+08	2021-02-18 17:42:53.923484+08	\N	https://i.imgur.com/4eair9X.jpeg	10000	f	\N
50	skirt	\N	\N	\N	Good skirt	2021-02-18 17:42:53.923484+08	2021-02-18 17:42:53.923484+08	\N	https://i.imgur.com/4eair9X.jpeg	10000	f	\N
2	skirt	\N	\N	41	Good skirt	2021-02-18 17:42:53.923484+08	2021-02-18 17:42:53.923484+08	\N	https://i.imgur.com/4eair9X.jpeg	10000	f	\N
\.


--
-- Name: inventories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventories_id_seq', 52, true);


--
-- PostgreSQL database dump complete
--

