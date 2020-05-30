One time:

- Run `now` to link the project
- Run `now dev` to develop locally

Dump remote DB to local:

`mongodump -h ds249873.mlab.com:49873 -d calistacrowdsourcing -u <user> -p <password> -o <output directory>`

Resotre dumped DB to localhost DB:

`mongorestore -h localhost:27917 -d calistacrowdsourcing db/backup-30-05-2020/calistacrowdsourcing`
