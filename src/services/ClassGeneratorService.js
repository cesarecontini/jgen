import Formatter from 'auto-format';
import { camelCase } from 'lodash';

const getClassName = (name) => {
	return capitalizeFirst(camelCase(name));
}

const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const getConstants = (constantString) => {
	return constantString.split('\n')
		.map(c => `private static final ${c};`)
		.join('\n');
}

const getAutowiredServices = (autowiredServicesString, isTest, MockBean = 'MockBean') => {
	return autowiredServicesString.split('\n')
		.map(c => `@${isTest ? MockBean : 'Autowired'}
    ${c};`)
		.join('\n');
}

const getEndpoints = (endpointsString) => {
	return endpointsString.split('\n')
		.map(c => {
			const [httpMethod, path, methodName, templateName] = c.split(' ');

			if(httpMethod.toLowerCase() === 'get') {
				return `private ModelAndView get${capitalizeFirst(methodName)}ModelAndView()
				{
					ModelAndView modelAndView = new ModelAndView("${templateName}");
					//        modelAndView.addObject("some-key", "Somevalue");
					return modelAndView;
				}

						@GetMapping(value="${path}")
                        public ModelAndView ${methodName}() 
                        {
							return get${capitalizeFirst(methodName)}ModelAndView();
                        }
                        `;
			} 
			else if(['post', 'put', 'delete'].indexOf(httpMethod.toLowerCase()) !== -1)
			{
				const redirectTo = templateName;
				return `@PostMapping(value="${path}")
				public ModelAndView ${methodName}(@Valid @ModelAttribute("form") MyForm form, BindingResult bindingResult) 
				{
				if (bindingResult.hasErrors()) {
					//TODO: implement model and view
					return new ModelAndView();
				}

				// TODO: use form and consume your service here!

				return new ModelAndView("redirect:${redirectTo}");
				}`
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

	const code = `package ${opts.basePackage}.${opts.controllersPackageName};

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ModelAttribute;

@Controller
public class ${getClassName(opts.controllerName)}
{

    ${getConstants(opts.constants)}

    ${getAutowiredServices(opts.autowiredServices, false)}

    ${getEndpoints(opts.endpoints)}
}`;

	const javaFormatter = Formatter.createJavaFormatter('    ');
	return javaFormatter.format(code).join('\n');
}

const generateControllerTestClass = (opts) => {
	const code = `package ${opts.basePackage}.${opts.controllersPackageName};

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

const generateServiceMethods = (serviceMethodString) => {
	return serviceMethodString.split('\n')
		.map(c => {
			const [visibilityKeyword, returnType, methodName] = c.split(' ');
			
			if(!visibilityKeyword || !returnType || !methodName) return '\n';

			if(returnType.toLowerCase() === 'void') {
				return `${visibilityKeyword} ${returnType} ${methodName}()
                        {
							//TODO: Please do implementation
                        }
                        `;
			} 
			else
			{
				return `${visibilityKeyword} ${returnType} ${methodName}()
                        {
							//TODO: Please complete implementation and return an object of type ${returnType}
							return (${returnType}) new Object();
                        }
                        `;
			}
		})
		.join('\n');
}

const generateServiceTestMethods = (serviceMethodString) => {
	return serviceMethodString.split('\n')
		.map(c => {
			const [visibilityKeyword, returnType, methodName] = c.split(' ');
			
			if(!visibilityKeyword || !returnType || !methodName) return '\n';

			return `void test${capitalizeFirst(methodName)}Method()
	{
		//TODO: Please complete implementation and return an object of type ${returnType}
		return (${returnType}) new Object();
	}
	`;
		})
		.join('\n');
}


const generateServiceClass = (opts) => {

	const code = `package ${opts.basePackage}.${opts.servicesPackageName};

import org.springframework.stereotype.Service;

@Service
public class ${opts.serviceName} {
	${getConstants(opts.constants)}

	${getAutowiredServices(opts.autowiredServices, false)}
	
	${generateServiceMethods(opts.serviceMethods)}
}`;

	const javaFormatter = Formatter.createJavaFormatter('    ');
	return javaFormatter.format(code).join('\n');
}

const generateServiceTestClass = (opts) => {
	return `package ${opts.basePackage}.${opts.servicesPackageName};

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class ${opts.serviceName}Test {

	${getConstants(opts.constants)}

	${getAutowiredServices(opts.autowiredServices, true, 'Mock')}

	@InjectMocks
	${opts.serviceName} service = new ${opts.serviceName}();

	@BeforeEach
	void setUp() {
		//TODO: SOME SETUP
	}

	${generateServiceTestMethods(opts.serviceMethods)}
}`;
}


export default {
	generateControllerClass,
	generateControllerTestClass,
	generateServiceClass,
	generateServiceTestClass
}