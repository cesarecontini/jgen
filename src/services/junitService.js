import jquery from 'jquery';

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

    jquery(html).filter(childElementsSelector)
        .each(function () {
            const tagName = jquery(this).prop('tagName');
            const id = this.id;
            const text = jquery(this).text();
            const isIdSet = id && id !== '';

            if (isIdSet) {
                output += `.andExpect(MockMvcResultMatchers.xpath("//${tagName.toLowerCase()}[@id='${id}']").exists())
                `;
            }

            if (isIdSet && !isTagToExclude(tagName, tagsToExclude)) {
                output += 
                    `.andExpect(MockMvcResultMatchers.xpath("//${tagName.toLowerCase()}[@id='${id}']")
                        .string(Matchers.equalToIgnoringWhiteSpace("${text
                        .replace(/^\s+|\s+$/g, '')
                        .replace(/\n/g, ' ')}")))
                        `;
            }

            if (tagName && tagName.toLowerCase() === 'a') {
                const href = jquery(this).attr('href');
                output += 
                    `.andExpect(MockMvcResultMatchers.xpath("//${tagName.toLowerCase()}[@id='${id}']/@href")
                    .string(Matchers.equalToIgnoringWhiteSpace("${href}")))
                    `;
            }

            if (tagName && tagName.toLowerCase() === 'form') {
                const action = jquery(this).attr('action');
                const method = jquery(this).attr('method');
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
                const type = jquery(this).attr('type');
                output += 
                    `.andExpect(MockMvcResultMatchers.xpath("//${tagName.toLowerCase()}[@id='${id}']/@type").string("${type}"))
                    `;

                if (type === 'radio' || type === 'checkbox')
                {
                    const checked = jquery(this).attr('checked');
                    if(checked) {
                         output += 
                             `.andExpect(MockMvcResultMatchers.xpath("//${tagName.toLowerCase()}[@id='${id}']/@checked").string("${checked}"))
                             `;
                    }
                }
            }
            
            if (tagName && tagName.toLowerCase() === 'select') {
                const options = jquery(this).find('option');
                output += 
                    `.andExpect(MockMvcResultMatchers.xpath("//${tagName.toLowerCase()}[@id='${id}']/option").nodeCount(${options.length}))
                    `;
                options.each(function (i) {
                    
                    output += 
                        `.andExpect(MockMvcResultMatchers.xpath("//${tagName.toLowerCase()}[@id='${id}']/option[${i + 1}]").exists())
                        `;

                    const optionText = jquery(this).text();
                    
                if (optionText) {
                        const optionValue = jquery(this).attr('value');
                        output += 
                            `.andExpect(MockMvcResultMatchers.xpath("//${tagName.toLowerCase()}[@id='${id}']/option[${i+1}]")
                            .string(Matchers.equalToIgnoringWhiteSpace("${optionText}")))
                            
                            `;
                        
                        output += 
                            `.andExpect(MockMvcResultMatchers.xpath("//${tagName.toLowerCase()}[@id='${id}']/option[${i + 1}]/@value")
                            .string(Matchers.equalToIgnoringWhiteSpace("${optionValue}")))
                            
                            `;
                    }

                    const selected = jquery(this).attr('selected');
                    if(selected) {
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

    return output;
};
