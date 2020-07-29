# futres-ui

## running examples:
[production (master branch)](futresdataportal-develop.netlify.app)

[development (develop branch)](futresdataportal-develop.netlify.app)

## API
The FuTRES API takes data from GEOME and loaded datasets from Cyverse DE
and assembles them in easily digestible chunks for the website.  This part
drives the drop-down lists on the query page as well as all of the Browse
data features.
[FutresAPI](https://github.com/futres/FutresAPI)

## Database 
This is a pointer to a nodejs proxy pointing to an ElasticSearch back-end.
This part drives the dynamic queries on the Query interface. 
For information see the [data-portal-proxy-engine-thingy](https://github.com/biocodellc/ppo-data-server/blob/master/docs/es_futres_proxy.md)

