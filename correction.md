🔷 Schema Correction Needed

Use Date instead of string for date fields
Use Number for ratings and year
Use Boolean / Enum for status instead of "1"
Change celebrityId to ObjectId with ref
Make genre, cast, awards arrays instead of single strings
Add validation (trim, URL regex, enums)
Use timestamps: true instead of manual createdAt/updatedAt
Add indexes on title, celebrityId, release_date
Make url field unique
Use structured object for awards instead of plain text

🔷 API Contract Kya Hota Hai?

API contract = API ka rulebook
Isme define hota hai:
Endpoint kya karta hai
Kaunse params required hain
Kaunse optional hain
Body me kya fields aayengi
Response kaisa milega
Errors kab aayenge

🔷 Api Endpoint's not following the restfull api rule

🔷 Api Level Validation is Missing