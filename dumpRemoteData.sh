psql $1 -c '\COPY "Topic" TO topics.csv WITH CSV HEADER'
psql $1 -c '\COPY "Source" TO sources.csv WITH CSV HEADER'
psql $1 -c '\COPY "Editor" TO editors.csv WITH CSV HEADER'
psql $1 -c '\COPY "Article" TO articles.csv WITH CSV HEADER'

rm -rf datadump
mkdir datadump
mv topics.csv datadump/topics.csv
mv sources.csv datadump/sources.csv
mv editors.csv datadump/editors.csv
mv articles.csv datadump/articles.csv

psql $2 -c 'TRUNCATE TABLE "Topic" RESTART IDENTITY CASCADE;'
psql $2 -c '\COPY "Topic" FROM datadump/topics.csv WITH CSV HEADER'
psql $2 -c 'TRUNCATE TABLE "Source" RESTART IDENTITY CASCADE;'
psql $2 -c '\COPY "Source" FROM datadump/sources.csv WITH CSV HEADER'
psql $2 -c 'TRUNCATE TABLE "Editor" RESTART IDENTITY CASCADE;'
psql $2 -c '\COPY "Editor" FROM datadump/editors.csv WITH CSV HEADER'
psql $2 -c 'TRUNCATE TABLE "Article" RESTART IDENTITY CASCADE;'
psql $2 -c '\COPY "Article" FROM datadump/articles.csv WITH CSV HEADER'
