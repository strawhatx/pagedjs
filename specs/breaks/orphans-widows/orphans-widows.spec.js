const TIMEOUT = 10000;

describe("orphans-widows", () => {
	let page;
	let lines;
	beforeAll(async () => {
		page = await loadPage("breaks/orphans-widows/orphans-widows.html");
		await page.rendered;

		// Count the line boxes of each paragraph on each page it appears on.
		lines = await page.evaluate(() => {
			let result = {};
			document.querySelectorAll(".pagedjs_page").forEach((pageElement) => {
				pageElement.querySelectorAll("p[id], p[data-id]").forEach((p) => {
					let id = p.id || p.dataset.id;
					let tops = new Set();
					let range = document.createRange();
					p.childNodes.forEach((node) => {
						if (node.nodeType === 3 && node.textContent.trim()) {
							range.selectNodeContents(node);
							// No for...of: Babel's helper isn't defined in the page.
							let rects = range.getClientRects();
							for (let i = 0; i < rects.length; i++) {
								if (rects[i].width) {
									tops.add(Math.round(rects[i].top));
								}
							}
						}
					});
					result[id] = result[id] || [];
					result[id].push(tops.size);
				});
			});
			return result;
		});
	}, TIMEOUT);

	afterAll(async () => {
		if (!DEBUG) {
			await page.close();
		}
	});

	it("moves a line over to satisfy widows", async () => {
		expect(lines.widow).toEqual([2, 2]);
	});

	it("moves the whole paragraph when orphans can't be satisfied", async () => {
		expect(lines.orphan).toEqual([4]);
	});

	it("moves the whole paragraph when satisfying widows would break orphans", async () => {
		expect(lines.both).toEqual([3]);
	});

	it("satisfies orphans: 3 and widows: 3", async () => {
		expect(lines.threes).toEqual([3, 3]);
	});

	it("satisfies widows for lines separated by <br>", async () => {
		expect(lines.br).toEqual([2, 2]);
	});

	it("uses the initial value of 2 for orphans and widows", async () => {
		expect(lines.initial).toEqual([2, 2]);
	});

	it("allows a single line either side with orphans: 1 and widows: 1", async () => {
		expect(lines.control).toEqual([3, 1]);
	});
});
