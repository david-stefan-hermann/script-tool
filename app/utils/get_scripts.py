from pathlib import Path
import ast
import re


def extract_docstring_fallback(file_content):
    """
    Manually extract the module-level docstring if ast.get_docstring fails.
    """
    first_quote_index = file_content.find('"""')
    if first_quote_index != -1:
        second_quote_index = file_content.find('"""', first_quote_index + 3)
        if second_quote_index != -1:
            return file_content[first_quote_index + 3 : second_quote_index].strip()
    return None


def extract_custom_attributes_from_docstring(file_content):
    """
    Extracts custom attributes 'Title' and 'Description' from a docstring.
    """
    try:
        module = ast.parse(file_content)
        docstring = ast.get_docstring(module)
        if docstring is None:  # Fallback if AST couldn't find the docstring
            docstring = extract_docstring_fallback(file_content)
    except SyntaxError:
        docstring = extract_docstring_fallback(file_content)  # Fallback on syntax error

    if not docstring:
        return {}

    # Define a pattern for key-value pairs in the docstring
    pattern = re.compile(r'^(\w+):\s*(.+)$', re.MULTILINE)
    attributes = dict(re.findall(pattern, docstring))

    print(attributes.get('Title', 'Untitled'))

    return {
        'Title': attributes.get('Title', 'Untitled'),
        'Description': attributes.get('Description', 'No description available.')
    }

def scan_directory_for_scripts(directory_path):
    """
    Scans the directory for Python files and extracts their path, title, and description.
    """
    scripts_info = []
    directory = Path(directory_path)

    for file_path in directory.glob('*.py'):
        if file_path.name != '__init__.py':
            with open(file_path, "r") as file:
                file_content = file.read()
            
            attributes = extract_custom_attributes_from_docstring(file_content)
            script_info = {
                'script_path': str(file_path),
                'script_title': attributes.get('Title'),
                'script_description': attributes.get('Description')
            }
            scripts_info.append(script_info)

    return scripts_info