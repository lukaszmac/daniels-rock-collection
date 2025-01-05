const fs = require('fs');
const CsvReadableStream = require('csv-reader');
const path = require("path");

let inputStream = fs.createReadStream('Jira Export Excel CSV (all fields) 20250102165131.csv', 'utf8');

inputStream
    .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true, multiline: true,  allowQuotes: true, asObject: true}))
    .on('data', function (rock) {
        //console.log('A row arrived: ', row);

        // Create the contents of the README file for this rock:
        const startingTemplate = `# ${rock.Summary}
${rock.Description}

<img height="300px" src="10000.jpg"/>

|       Field | Value                   |
|------------:|-------------------------|
|   **Title** | ${rock.Summary} |
|     **Key** | ${rock['Issue key']} |
| **Created** | ${rock.Created} |
        `;

        let contentToUse = startingTemplate;

        // Clean up the content by removing image references:
        // Define a pattern for image references:
        const imageReferencePattern = /!.+\|.+!/g;
        contentToUse = contentToUse.replaceAll(imageReferencePattern, '');






        // Get the file path to the rock folder:
        const rocksFolderPath = 'rocks';
        const rockFolderPath = path.join(rocksFolderPath, rock['Issue key']);
        const rockReadmePath = path.join(rockFolderPath, 'README.md');


        // Get all the images that we have for that rock:
        const allFilesInRockFolder = fs.readdirSync(rockFolderPath);
        const allImageFilesInRockFolder = allFilesInRockFolder.filter((filePath)=> filePath.match(/\.jpg$/ig));

        // Create the references to the image for each image:
        let imageReferences = '';
        for (let pathToRockImage of allImageFilesInRockFolder)
        {
            // Get the path to the image:
            const imageReference = `<img height="300px" src="${pathToRockImage}"/>`;

            // Add this to the end of our image references:
            imageReferences += "\n" + imageReference;
        }

        // Add the image references to the content:
        contentToUse = contentToUse.replaceAll('<img height="300px" src="10000.jpg"/>', imageReferences);

        // Write the readme file:
        console.log(contentToUse);
        fs.writeFileSync(rockReadmePath, contentToUse);

    })
    .on('end', function () {
        console.log('No more rows!');
    });
