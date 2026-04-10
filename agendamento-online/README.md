# Agendamento Online

Base inicial de front-end + backend para um sistema de agendamento usando
HTML, CSS, JavaScript, PHP e MySQL.

## Estrutura

- `index.html`: interface principal
- `css/style.css`: identidade visual
- `js/app.js`: integracao do front com a API
- `api/`: endpoints em PHP
- `database/schema.sql`: banco e carga inicial

## Como subir no XAMPP

1. Abra o phpMyAdmin.
2. Importe o arquivo `database/schema.sql`.
3. Confirme se o banco criado se chama `agendamento_online`.
4. Se seu MySQL usa usuario ou senha diferente de `root` e vazio, ajuste `api/config.php`.
5. Abra `http://localhost/projetos/agendamento-online/`.

## Endpoints

- `GET api/services.php`
- `GET api/availability.php?service_id=1&date=2026-03-19`
- `POST api/bookings.php`

## Exemplo de payload para reserva

```json
{
  "service_id": 1,
  "appointment_date": "2026-03-19",
  "appointment_time": "10:30",
  "name": "Cliente Exemplo",
  "email": "cliente@exemplo.com",
  "phone": "(65) 99999-9999",
  "notes": "Primeiro atendimento"
}
```
