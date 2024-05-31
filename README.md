# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Farah Briki | 300386 |
| Ali Raed Ben Mustapha | 300392 |
| Khalil Achache | 300350 |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (29th March, 5pm)

The report for the milestone 2 is available in the `Milestone2.md` file.

## Milestone 2 (26th April, 5pm)

The report for the milestone 2 is available in the `Milestone2.md` file.

## Milestone 3 (31st May, 5pm)

The link to the video presentation in the `screencast.mp4` file.

The process book can be found in the `process_book.pdf` file.

The website is available at the following link: [https://com-480-data-visualization.github.io/com-480-project-tafrika/](https://com-480-data-visualization.github.io/com-480-project-tafrika/)


## Technical setup

### To run the website locally
To run the website locally, you first need to clone the repository:
````
git clone https://github.com/com-480-data-visualization/com-480-project-tafrika.git
cd com-480-project-tafrika/docs
````

Then you run the following command:
````
python -m http.server
````

This will start a local server on port 8000. You can then access the website by going to `http://localhost:8000/` in your browser.


### Website structure

Inside the `docs` folder, there's the source code of the website.
The website is structured as follows:
- `index.html`: the main page of the website
- `css/`: contains the css files for the main page
- `js/`: contains the javascript files for the main page
- `assets/`: contains the images used in the website
- `plots/`: contains the plots used in the website

Each plot is in a separate folder and represents a different visualization. They are self-contained and can be run independently. They are added to the main page using iframes.




