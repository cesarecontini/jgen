import Formatter from 'auto-format';

const getConstants = (constantString) => {
	return constantString.split('\n')
		.map(c => `private static final ${c};`)
		.join('\n');
}

const getAutowiredServices = (autowiredServicesString, isTest) => {
	return autowiredServicesString.split('\n')
		.map(c => `@${isTest ? 'MockBean' : 'Autowired'}
    ${c};`)
		.join('\n');
}

const getEndpoints = (endpointsString) => {
	return endpointsString.split('\n')
		.map(c => {
			const [httpMethod, path, methodName, templateName] = c.split(' ');

			if(httpMethod.toLowerCase() === 'get') {
				return `@GetMapping(value="${path}")
                        public ModelAndView ${methodName}() 
                        {

							ModelAndView modelAndView = new ModelAndView("${templateName}");
							//        modelAndView.addObject("some-key", "Something");
							return modelAndView;
                        }
                        `;
			}
			
			return '';
			
		})
		.join('\n');
}

const getTestEndpoints = (endpointsString) => {
	return endpointsString.split('\n')
		.map(c => {
			const [httpMethod, path, methodName, templateName] = c.split(' ');

			if(httpMethod.toLowerCase() === 'get') {
				return `@Test
						void test${methodName}MethodAndAssertStatusAndTemplateAreOk() throws Exception {
							mockMvc.perform(MockMvcRequestBuilders.get("${path}"))
									.andExpect(MockMvcResultMatchers.view().name("${templateName}"))
									.andExpect(MockMvcResultMatchers.status().isOk());
						}
					
						@Test
						void test${methodName}MethodAndTestHtml() throws Exception {
							mockMvc.perform(MockMvcRequestBuilders.get("${path}"))
									// TODO: ADD HTML ASSERTIONS AS NEEDED
									.andExpect(MockMvcResultMatchers.xpath("//div[@id='bad-id']").exists());
						}
                        `;
			}
			
			return '';
			
		})
		.join('\n');
}

const generateControllerClass = (opts) => {
	const code = `package ${opts.basePackage}.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class ${opts.controllerName}
{

    ${getConstants(opts.constants)}

    ${getAutowiredServices(opts.autowiredServices, false)}

    ${getEndpoints(opts.endpoints)}
}`;

	const javaFormatter = Formatter.createJavaFormatter('    ');
	return javaFormatter.format(code).join('\n');

}

const generateControllerTestClass = (opts) => {
	const code = `package ${opts.basePackage}.controller;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

@ExtendWith(SpringExtension.class)
@WebMvcTest(controllers = ${opts.controllerName}.class)
class ${opts.controllerName}Test {

	${getConstants(opts.constants)}

	@Autowired
	private MockMvc mockMvc;

	${getAutowiredServices(opts.autowiredServices, true)}

	${getTestEndpoints(opts.endpoints)}
}`;

	const javaFormatter = Formatter.createJavaFormatter('    ');
	return javaFormatter.format(code).join('\n');
}

export default {
	generateControllerClass,
	generateControllerTestClass
}