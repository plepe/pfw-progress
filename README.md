# Platz für Wien - Entwicklung der Unterschriften
## INSTALLATION
```sh
git clone https://github.com/plepe/pfw-progress
cd pfw-progress
npm install
```

Get data files `progress.csv` and `plz.csv` (send me an email) and place them in the directory.

## Update data
### Global compaign data
Run `snapshot` to add today's value to progress.csv

### Data grouped by day and plz
Download CSV file from participant list and place it in this directory as `data.csv`. Run `php count_bezirk.php`. Delete data.csv (GDPR!)
