import Formatter from 'auto-format';
import cheerio from 'cheerio';

const isTagToExclude = (tagName, tagsToExclude) => {
	return tagsToExclude.indexOf(tagName.toLowerCase()) !== -1;
};

export default (path, html) => {

	const tagsToExclude = ['input', 'form', 'select', 'table', 'iframe'];
	const childElementsSelector = '[id]';

	let output = '';

	output += `
    @Test
    public void testPageElements() throws Exception
	{
        mockMvc.perform(MockMvcRequestBuilders.get("${path}"))
        `;

	const $ = cheerio.load(html);

	$('*').filter(childElementsSelector)
		.each(function () {
			const tagName = $(this).prop('tagName');
			const id = $(this).attr('id');
			const text = $(this).text();
			const isIdSet = id && id !== '';

			if (isIdSet) {
				output += `.andExpect(MockMvcResultMatchers.xpath("//${tagName.toLowerCase()}[@id='${id}']").exists())
                `;
			}

			if (isIdSet && !isTagToExclude(tagName, tagsToExclude)) {
				output +=
                    `.andExpect(MockMvcResultMatchers.xpath("//${tagName.toLowerCase()}[@id='${id}']")
						.string(Matchers.equalToIgnoringWhiteSpace("${text.replace(/^\s+|\s+$/g, '').replace(/\n/g, ' ')}")))
						
					`;
			}

			if (tagName && tagName.toLowerCase() === 'a') {
				const href = $(this).attr('href');
				output +=
                    `.andExpect(MockMvcResultMatchers.xpath("//${tagName.toLowerCase()}[@id='${id}']/@href")
						.string(Matchers.equalToIgnoringWhiteSpace("${href}")))
						
					`;
			}

			if (tagName && tagName.toLowerCase() === 'form') {
				const action = $(this).attr('action');
				const method = $(this).attr('method');
				output +=
                    `.andExpect(MockMvcResultMatchers.xpath("//${tagName.toLowerCase()}[@id='${id}']/@action")
						.string(Matchers.equalToIgnoringWhiteSpace("${action}")))
						
                    `;
				output +=
                    `.andExpect(MockMvcResultMatchers.xpath("//${tagName.toLowerCase()}[@id='${id}']/@method")
						.string(Matchers.equalToIgnoringWhiteSpace("${method}")))
						
                    `;
			}

			if (tagName && tagName.toLowerCase() === 'input') {
				const type = $(this).attr('type');
				output +=
                    `.andExpect(MockMvcResultMatchers.xpath("//${tagName.toLowerCase()}[@id='${id}']/@type").string("${type}"))
					
					`;

				if (type === 'radio' || type === 'checkbox') {
					const checked = $(this).attr('checked');
					if (checked) {
						output +=
                            `.andExpect(MockMvcResultMatchers.xpath("//${tagName.toLowerCase()}[@id='${id}']/@checked").string("${checked}"))
							 
							`;
					}
				}
			}

			if (tagName && tagName.toLowerCase() === 'select') {
				const options = $(this).find('option');
				output +=
                    `.andExpect(MockMvcResultMatchers.xpath("//${tagName.toLowerCase()}[@id='${id}']/option").nodeCount(${options.length}))
					
					`;
				options.each(function (i) {

					output +=
                        `.andExpect(MockMvcResultMatchers.xpath("//${tagName.toLowerCase()}[@id='${id}']/option[${i + 1}]").exists())
						
						`;

					const optionText = $(this).text();

					if (optionText) {
						const optionValue = $(this).attr('value');
						output +=
                            `.andExpect(MockMvcResultMatchers.xpath("//${tagName.toLowerCase()}[@id='${id}']/option[${i + 1}]")
                            	.string(Matchers.equalToIgnoringWhiteSpace("${optionText}")))
                            
                            `;

						output +=
                            `.andExpect(MockMvcResultMatchers.xpath("//${tagName.toLowerCase()}[@id='${id}']/option[${i + 1}]/@value")
                            	.string(Matchers.equalToIgnoringWhiteSpace("${optionValue}")))
                            
                            `;
					}

					const selected = $(this).attr('selected');
					if (selected) {
						output +=
                            `.andExpect(MockMvcResultMatchers.xpath("//${tagName.toLowerCase()}[@id='${id}']/option[${i + 1}]/@selected")
                            	.string(Matchers.equalToIgnoringWhiteSpace("${selected}")))
                            `;
					}
				});

			}
		});
	output += `;
	}`;
	
	const javaFormatter = Formatter.createJavaFormatter('    ');
	return javaFormatter.format(output).join('\n');
};
