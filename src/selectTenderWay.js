const helper = require('./helper');

const selectTenderWay = {
    select: async (page, tenderWay) => {
        const elements =  await page.evaluate(() => {
            const allElements = document.querySelectorAll('input, select, radio').map(v => v);
            console.log(allElements[0].id);
            return allElements;
        });
        console.log(elements);
    }
}

module.exports = selectTenderWay;