--
-- PostgreSQL database dump
--

\restrict rupYBUynQaTv5hkky1tO9dTgnLTFeL18LckMdXJXolRBnbYgzd3rsbqcdx2BnYl

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

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
-- Data for Name: price; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.price (name, price) VALUES ('platinum', 100.00);
INSERT INTO public.price (name, price) VALUES ('palladium', 70.00);
INSERT INTO public.price (name, price) VALUES ('rhodium', 400.00);
INSERT INTO public.price (name, price) VALUES ('USD', 150000.00);
INSERT INTO public.price (name, price) VALUES ('damping', 0.20);


--
-- PostgreSQL database dump complete
--

\unrestrict rupYBUynQaTv5hkky1tO9dTgnLTFeL18LckMdXJXolRBnbYgzd3rsbqcdx2BnYl

