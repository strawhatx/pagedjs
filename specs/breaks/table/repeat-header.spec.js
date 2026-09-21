const TIMEOUT = 10000;

describe("breaks-table-repeat-header", () => {
	let page;
	beforeAll(async () => {
		page = await loadPage("breaks/table/repeat-header.html");
		return page.rendered;
	}, TIMEOUT);

	afterAll(async () => {
		if (!DEBUG) {
			await page.close();
		}
	});

	it("repeats thead and colgroup on split table fragments by default", async () => {
		let counts = await page.evaluate(() => {
			let tables = Array.from(document.querySelectorAll("table.table:not(.no-repeat)"));
			return {
				tableCount: tables.length,
				theadCount: tables.filter((table) => table.querySelector("thead")).length,
				colgroupCount: tables.filter((table) => table.querySelector("colgroup")).length,
			};
		});

		expect(counts.tableCount).toBeGreaterThan(1);
		expect(counts.theadCount).toBe(counts.tableCount);
		expect(counts.colgroupCount).toBe(counts.tableCount);
	});

	it("does not repeat thead on tables opted out with --pagedjs-table-repeat-header: none", async () => {
		let counts = await page.evaluate(() => {
			let tables = Array.from(document.querySelectorAll("table.no-repeat"));
			return {
				tableCount: tables.length,
				theadCount: tables.filter((table) => table.querySelector("thead")).length,
			};
		});

		expect(counts.tableCount).toBeGreaterThan(1);
		expect(counts.theadCount).toBe(1);
	});

	if (!DEBUG) {
		it("should create a pdf", async () => {
			let pdf = await page.pdf(PDF_SETTINGS);
			expect(pdf).toMatchPDFSnapshot(1);
			expect(pdf).toMatchPDFSnapshot(2);
		});
	}
});
