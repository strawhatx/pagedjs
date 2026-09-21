const TIMEOUT = 10000;

describe("float reflow", () => {
	let page;
	beforeAll(async () => {
		page = await loadPage("breaks/float/reflow-beside-float.html");
		return page.rendered;
	}, TIMEOUT);

	afterAll(async () => {
		if (!DEBUG) {
			await page.close();
		}
	});

	it("renders content beside a multi-page float instead of deferring it until the float finishes", async () => {
		let pages = {};
		for (let id of ["p1", "p2", "p3", "p4", "p5", "p6"]) {
			pages[id] = await page.$eval(`[id="${id}"]`, (r) => {
				return r.closest(".pagedjs_page").dataset.pageNumber;
			});
		}

		expect(pages).toEqual({
			p1: "1",
			p2: "1",
			p3: "1",
			p4: "1",
			p5: "1",
			p6: "1",
		});
	});

	it("still continues the float itself onto a second page", async () => {
		let floatPages = await page.$$eval(".pagedjs_page", (pages) => {
			return pages
				.filter((p) => p.querySelector(".float"))
				.map((p) => p.dataset.pageNumber);
		});

		expect(floatPages).toEqual(["1", "2"]);
	});
});
