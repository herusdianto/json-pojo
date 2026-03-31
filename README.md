# JSON to POJO Converter

A client-side web tool for converting JSON to Java POJO classes with Lombok annotations.

**100% Client-side - No data sent to server!**

## Features

- ✅ Convert JSON to Java POJO classes
- ✅ Generate Lombok annotations (@Data, @Builder, @NoArgsConstructor, @AllArgsConstructor, etc.)
- ✅ Jackson annotations support (@JsonProperty)
- ✅ Nested object support with automatic class generation
- ✅ Array/List type detection
- ✅ Primitive type option (int, long, double, boolean)
- ✅ Custom package name
- ✅ Custom root class name
- ✅ Format JSON input
- ✅ Copy to clipboard
- ✅ Download as .java file
- ✅ Dark/Light mode toggle
- ✅ Responsive design
- ✅ Statistics display (classes, fields, annotations count)

## Lombok Annotations Supported

| Annotation | Description |
|------------|-------------|
| `@Data` | Generates getters, setters, toString, equals, hashCode |
| `@Builder` | Generates builder pattern |
| `@NoArgsConstructor` | Generates no-args constructor |
| `@AllArgsConstructor` | Generates all-args constructor |
| `@Getter` | Generates getters only |
| `@Setter` | Generates setters only |
| `@ToString` | Generates toString method |
| `@EqualsAndHashCode` | Generates equals and hashCode methods |

## Additional Options

| Option | Description |
|--------|-------------|
| Jackson Annotations | Adds `@JsonProperty` for field name mapping |
| Private Fields | Uses private field visibility |
| Generate Nested Classes | Creates separate classes for nested objects |
| Use Primitive Types | Uses `int`, `long`, `double`, `boolean` instead of wrapper classes |

## Usage

### Option 1: Open directly in browser

Simply open `public/index.html` in your web browser.

### Option 2: Use a local server

```bash
# Using Python
cd public
python -m http.server 8000

# Using Node.js (http-server)
npx http-server public

# Using PHP
cd public
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Example

### Input JSON
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "active": true,
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  },
  "roles": ["admin", "user"]
}
```

### Output POJO (with @Data and Jackson annotations)
```java
package com.example.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.Data;

@Data
public class User {

    private Integer id;

    private String name;

    private String email;

    private Boolean active;

    private Address address;

    private List<String> roles;
}

@Data
public class Address {

    private String street;

    private String city;

    @JsonProperty("zipCode")
    private String zipCode;
}
```

## Technologies Used

- HTML5
- CSS3 (with CSS Variables for theming)
- Vanilla JavaScript (ES6+)
- No external dependencies

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License

## Contributing

Contributions are welcome! Feel free to submit a Pull Request.

## Demo

[https://herusdianto.github.io/json-pojo/](https://herusdianto.github.io/json-pojo/)