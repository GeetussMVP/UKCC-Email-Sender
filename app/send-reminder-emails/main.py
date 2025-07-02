from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
import time

def scrape_bagbag():
    options = Options()
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    try:
        print("Opening website...")
        driver.get("https://bagbag.cash4clothesuk.org/index.php")
        
        # Quick login - 2 seconds then straight to login
        time.sleep(2)
        
        print("Looking for login fields...")
        
        # Try multiple ways to find username field
        username_field = None
        for selector in ["input[name='username']", "input[type='text']", "#username", ".username"]:
            try:
                username_field = driver.find_element(By.CSS_SELECTOR, selector)
                break
            except:
                continue
        
        if not username_field:
            print("Cannot find username field")
            inputs = driver.find_elements(By.TAG_NAME, "input")
            for i, inp in enumerate(inputs):
                print(f"  {i}: type={inp.get_attribute('type')}, name={inp.get_attribute('name')}")
            return 0, 0
        
        # Try multiple ways to find password field
        password_field = None
        for selector in ["input[name='password']", "input[type='password']", "#password", ".password"]:
            try:
                password_field = driver.find_element(By.CSS_SELECTOR, selector)
                break
            except:
                continue
        
        if not password_field:
            print("Cannot find password field")
            return 0, 0
        
        print("Entering credentials...")
        username_field.clear()
        username_field.send_keys("User1")
        
        password_field.clear()
        password_field.send_keys("dr5487")
        
        # Find submit button
        submit_button = None
        for selector in ["input[type='submit']", "button[type='submit']", "button", "input[value*='login']"]:
            try:
                submit_button = driver.find_element(By.CSS_SELECTOR, selector)
                break
            except:
                continue
        
        if not submit_button:
            print("Cannot find submit button")
            return 0, 0
        
        print("Clicking login...")
        submit_button.click()
        
        # Check if login worked
        time.sleep(3)
        current_url = driver.current_url
        print(f"Current URL: {current_url}")
        
        if current_url.endswith("index.php") and "username" in driver.page_source.lower():
            print("Still on login page - login failed")
            return 0, 0
        
        print("Login successful!")
        
        # Wait 2 seconds then click calendar
        time.sleep(2)
        
        print("Looking for calendar...")
        
        # Robust calendar detection (brought back)
        calendar_found = False
        
        # Method 1: Direct selectors for calendar
        calendar_selectors = [
            "a[href*='calendar']",
            "a[href*='cal']", 
            ".calendar",
            "#calendar"
        ]
        
        for selector in calendar_selectors:
            try:
                calendar_elem = driver.find_element(By.CSS_SELECTOR, selector)
                if calendar_elem.is_displayed():
                    print(f"Found calendar button: {calendar_elem.text}")
                    calendar_elem.click()
                    calendar_found = True
                    break
            except:
                continue
        
        # Method 2: Look for text containing 'calendar'
        if not calendar_found:
            clickable_elements = driver.find_elements(By.XPATH, "//a | //button | //input[@type='button']")
            for element in clickable_elements:
                try:
                    text = element.text.lower()
                    if 'calendar' in text and element.is_displayed():
                        print(f"Found calendar by text: {element.text}")
                        element.click()
                        calendar_found = True
                        break
                except:
                    continue
        
        # Method 3: XPath fallback
        if not calendar_found:
            calendar_elements = driver.find_elements(By.XPATH, "//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'calendar')]")
            if calendar_elements:
                print(f"Found calendar via XPath: {calendar_elements[0].text}")
                calendar_elements[0].click()
                calendar_found = True
        
        if not calendar_found:
            print("Calendar not found! Available clickable elements:")
            clickable = driver.find_elements(By.XPATH, "//a | //button")
            for elem in clickable[:10]:
                try:
                    text = elem.text or elem.get_attribute('value') or elem.get_attribute('href') or 'No text'
                    if text.strip():
                        print(f"  - {text[:40]}")
                except:
                    pass
            return 0, 0
        
        time.sleep(2)
        
        print("Scanning table rows for collections...")
        
        # Look for table rows containing collection_london and bags_delivery
        result = driver.execute_script("""
            var greenCount = 0;
            var yellowCount = 0;
            var greenRows = [];
            var yellowRows = [];
            
            // Find all table rows
            var rows = document.querySelectorAll('tr');
            
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                var rowHTML = row.innerHTML;
                var rowText = row.textContent || row.innerText || '';
                
                // Check if this row contains collection_london class
                if (rowHTML.includes('collection_london') || row.querySelector('.collection_london')) {
                    greenCount++;
                    greenRows.push({
                        index: i,
                        text: rowText.trim().substring(0, 100),
                        hasCollectionClass: !!row.querySelector('.collection_london')
                    });
                }
                
                // Check if this row contains bags_delivery class  
                if (rowHTML.includes('bags_delivery') || row.querySelector('.bags_delivery')) {
                    yellowCount++;
                    yellowRows.push({
                        index: i,
                        text: rowText.trim().substring(0, 100),
                        hasDeliveryClass: !!row.querySelector('.bags_delivery')
                    });
                }
            }
            
            // Also check all elements with these classes directly
            var collectionElements = document.querySelectorAll('.collection_london');
            var deliveryElements = document.querySelectorAll('.bags_delivery');
            
            var directGreen = 0;
            var directYellow = 0;
            
            for (var i = 0; i < collectionElements.length; i++) {
                var elem = collectionElements[i];
                if (elem.offsetParent !== null) { // visible element
                    directGreen++;
                }
            }
            
            for (var i = 0; i < deliveryElements.length; i++) {
                var elem = deliveryElements[i];
                if (elem.offsetParent !== null) { // visible element
                    directYellow++;
                }
            }
            
            return {
                rowMethod: {
                    green: greenCount,
                    yellow: yellowCount,
                    greenRows: greenRows,
                    yellowRows: yellowRows
                },
                directMethod: {
                    green: directGreen,
                    yellow: directYellow
                }
            };
        """)
        
        # Use row method results
        green_count = result['rowMethod']['green']
        yellow_count = result['rowMethod']['yellow']
        
        print(f"Row method: {green_count} green rows, {yellow_count} yellow rows")
        print(f"Direct method: {result['directMethod']['green']} green elements, {result['directMethod']['yellow']} yellow elements")
        
        # Show sample row data
        if result['rowMethod']['greenRows']:
            print("\nGreen rows (collection_london):")
            for i, row in enumerate(result['rowMethod']['greenRows'][:3]):
                print(f"  Row {row['index']}: {row['text'][:50]}...")
        
        if result['rowMethod']['yellowRows']:
            print("\nYellow rows (bags_delivery):")
            for i, row in enumerate(result['rowMethod']['yellowRows'][:3]):
                print(f"  Row {row['index']}: {row['text'][:50]}...")
        
        # Keep browser open for 3 seconds only
        time.sleep(3)
        
        return green_count, yellow_count
        
    except Exception as e:
        print(f"Error: {e}")
        time.sleep(3)
        return 0, 0
        
    finally:
        driver.quit()

if __name__ == "__main__":
    green, yellow = scrape_bagbag()
    print(f"\nFinal result - Green: {green}, Yellow: {yellow}")