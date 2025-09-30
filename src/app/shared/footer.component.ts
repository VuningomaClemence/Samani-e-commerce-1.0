import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, MatIconModule],
  template: `
    <footer>
      <div class="container">
        <div class="footer-grid">
          <div class="footer-column">
            <h3>Samani</h3>
            <p>
              Votre destination premium pour des meubles de qualité supérieure,
              alliant design et confort.
            </p>
            <div class="social-links">
              <a href="https://x.com/Clemence_2874"
                ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                  <!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                  <path
                    d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96zM457.1 180L353.3 298.6L475.4 460L379.8 460L305 362.1L219.3 460L171.8 460L282.8 333.1L165.7 180L263.7 180L331.4 269.5L409.6 180L457.1 180zM419.3 431.6L249.4 206.9L221.1 206.9L392.9 431.6L419.3 431.6z"
                  /></svg
              ></a>
              <a href="https://www.linkedin.com/in/vuningoma-clémence-268739335"
                ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                  <!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                  <path
                    d="M512 96L127.9 96C110.3 96 96 110.5 96 128.3L96 511.7C96 529.5 110.3 544 127.9 544L512 544C529.6 544 544 529.5 544 511.7L544 128.3C544 110.5 529.6 96 512 96zM231.4 480L165 480L165 266.2L231.5 266.2L231.5 480L231.4 480zM198.2 160C219.5 160 236.7 177.2 236.7 198.5C236.7 219.8 219.5 237 198.2 237C176.9 237 159.7 219.8 159.7 198.5C159.7 177.2 176.9 160 198.2 160zM480.3 480L413.9 480L413.9 376C413.9 351.2 413.4 319.3 379.4 319.3C344.8 319.3 339.5 346.3 339.5 374.2L339.5 480L273.1 480L273.1 266.2L336.8 266.2L336.8 295.4L337.7 295.4C346.6 278.6 368.3 260.9 400.6 260.9C467.8 260.9 480.3 305.2 480.3 362.8L480.3 480z"
                  /></svg
              ></a>
              <a href="https://github.com/VuningomaClemence"
                ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                  <!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                  <path
                    d="M544 160C544 124.7 515.3 96 480 96L160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160zM361.8 471.7C361.8 469.9 361.8 465.7 361.9 460.1C362 448.7 362 431.3 362 416.4C362 400.8 356.8 390.9 350.7 385.7C387.7 381.6 426.7 376.5 426.7 312.6C426.7 294.4 420.2 285.3 409.6 273.6C411.3 269.3 417 251.6 407.9 228.6C394 224.3 362.2 246.5 362.2 246.5C335.6 239 305.6 239 279 246.5C279 246.5 247.2 224.3 233.3 228.6C224.2 251.5 229.8 269.2 231.6 273.6C221 285.3 216 294.4 216 312.6C216 376.2 253.3 381.6 290.3 385.7C285.5 390 281.2 397.4 279.7 408C270.2 412.3 245.9 419.7 231.4 394.1C222.3 378.3 205.9 377 205.9 377C189.7 376.8 204.8 387.2 204.8 387.2C215.6 392.2 223.2 411.4 223.2 411.4C232.9 441.1 279.3 431.1 279.3 431.1C279.3 440.1 279.4 452.8 279.4 461.7C279.4 466.5 279.5 470.3 279.5 471.7C279.5 476 276.5 481.2 268 479.7C202 457.6 155.8 394.8 155.8 321.4C155.8 229.6 226 159.9 317.8 159.9C409.6 159.9 484 229.6 484 321.4C484.1 394.8 439.3 457.7 373.3 479.7C364.9 481.2 361.8 476 361.8 471.7zM271.3 416.9C271.1 415.4 272.4 414.1 274.3 413.7C276.2 413.5 278 414.3 278.2 415.6C278.5 416.9 277.2 418.2 275.2 418.6C273.3 419 271.5 418.2 271.3 416.9zM262.2 420.1C260 420.3 258.5 419.2 258.5 417.7C258.5 416.4 260 415.3 262 415.3C263.9 415.1 265.7 416.2 265.7 417.7C265.7 419 264.2 420.1 262.2 420.1zM247.9 417.9C246 417.5 244.7 416 245.1 414.7C245.5 413.4 247.5 412.8 249.2 413.2C251.2 413.8 252.5 415.3 252 416.6C251.6 417.9 249.6 418.5 247.9 417.9zM235.4 410.6C233.9 409.3 233.5 407.4 234.5 406.5C235.4 405.4 237.3 405.6 238.8 407.1C240.1 408.4 240.6 410.4 239.7 411.2C238.8 412.3 236.9 412.1 235.4 410.6zM226.9 400.6C225.8 399.1 225.8 397.4 226.9 396.7C228 395.8 229.7 396.5 230.6 398C231.7 399.5 231.7 401.3 230.6 402.1C229.7 402.7 228 402.1 226.9 400.6zM220.6 391.8C219.5 390.5 219.3 389 220.2 388.3C221.1 387.4 222.6 387.9 223.7 388.9C224.8 390.2 225 391.7 224.1 392.4C223.2 393.3 221.7 392.8 220.6 391.8zM214.6 385.4C213.3 384.8 212.7 383.7 213.1 382.8C213.5 382.2 214.6 381.9 215.9 382.4C217.2 383.1 217.8 384.2 217.4 385C217 385.9 215.7 386.1 214.6 385.4z"
                  /></svg
              ></a>
              <a href="mailto:marieclemence2874@gmail.com"
                ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                  <!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                  <path
                    d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96zM305.1 331.9L204.4 271.4C196.7 266.8 192 258.5 192 249.5C192 235.4 203.4 224 217.5 224L422.4 224C436.5 224 447.9 235.4 447.9 249.5C447.9 258.5 443.2 266.8 435.5 271.4L334.9 331.9C330.4 334.6 325.3 336 320 336C314.7 336 309.6 334.6 305.1 331.9zM448 301.3L448 384C448 401.7 433.7 416 416 416L224 416C206.3 416 192 401.7 192 384L192 301.3L288.7 359.3C298.1 365 309 368 320 368C331 368 341.9 365 351.3 359.3L448 301.3z"
                  /></svg
              ></a>
            </div>
          </div>

          <div class="footer-column">
            <h3>produits</h3>
            <ul>
              <li>
                <a routerLink="/chaises" routerLinkActive="active-link"
                  >Chaises</a
                >
              </li>
              <li>
                <a routerLink="/canapes" routerLinkActive="active-link"
                  >Canapés</a
                >
              </li>
              <li>
                <a routerLink="/tables" routerLinkActive="active-link"
                  >Tables</a
                >
              </li>
              <li>
                <a routerLink="/armoires" routerLinkActive="active-link"
                  >Armoires</a
                >
              </li>
            </ul>
          </div>

          <div class="footer-column">
            <h3>+ d'infos</h3>
            <ul>
              <li>
                <i class="fas fa-map-marker-alt"></i>Nyawera || Bref Home Design
              </li>
              <li>
                <a href="tel:+243977406714"
                  ><i class="fas fa-phone"></i>Numéro de téléphone(whatsapp):
                  +243 977406714</a
                >
              </li>
              <li>
                <i class="fas fa-clock"></i> Horaire d'ouverture: Lun-Sam de
                9h-19h
              </li>
            </ul>
          </div>
        </div>
        <div class="copyright">
          <p>&copy; 2025samani. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  `,
  styles: `
footer {
  background-color: #1a252f;
  color: white;
  padding: 2rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.footer-column h3 {
  font-size: 18px;
  margin-bottom: 20px;
  position: relative;
  padding-bottom: 10px;
}

.footer-column h3::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 40px;
  height: 2px;
  background-color: #e74c3c;
}

.footer-column ul li {
  margin-bottom: 10px;
}

.footer-column ul li a:hover {
  color: #e74c3c;
}

.social-links {
  display: flex;
  gap: 15px;
}

.social-links a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10%;
  transition: all 0.3s;
}

.social-links a:hover {
  background-color: #e74c3c;
  transform: translateY(-3px);
}

.copyright {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
}

  `,
})
export class FooterComponent {}
