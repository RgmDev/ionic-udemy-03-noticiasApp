import { Component, Input } from '@angular/core';
import { Article } from 'src/app/interfaces';
import { ActionSheetButton, ActionSheetController, Platform } from '@ionic/angular';

import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';

import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
})
export class ArticleComponent {

  @Input() article: Article;
  @Input() index: number;

  constructor(
    private iab: InAppBrowser,
    private platform: Platform,
    private actionSheetCtrl: ActionSheetController,
    private socialSharing: SocialSharing,
    private storageService: StorageService
  ) { }

  openArticle() {
    if(this.platform.is('ios') || this.platform.is('android')) {
      const browser = this.iab.create(this.article.url);
      browser.show();
      return;
    }
    window.open(this.article.url, '_blank');
  }

  async onOpenMenu() {

    const articleInFavorite = this.storageService.articleInFavorite(this.article);

    const defaultButtons: ActionSheetButton[] = [
      {
        text: 'Compatir',
        icon: 'share-outline',
        handler: () => this.onShareArticle()
      },
      {
        text: articleInFavorite ? 'Remover favorito' : 'Favorito',
        icon: articleInFavorite ? 'heart' : 'heart-outline',
        handler: () => this.onToggleFavorite()
      },
      {
        text: 'Cancelar',
        icon: 'close-outline',
        role: 'cancel'
      }
    ];

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: defaultButtons
    });

    await actionSheet.present();
  }

  onShareArticle() {
    const { title, source, url } = this.article;
    if(this.platform.is('cordova')) {
      this.socialSharing.share(
        title,
        source.name,
        null,
        url
      );
    } else {
      if (navigator.share) {
        navigator.share({
          title: title,
          text: source.name,
          url: url,
        })
          .then(() => console.log('Successful share'))
          .catch((error) => console.log('Error sharing', error));
      } else {
        console.log('No se puede compartir');
      }
    }

    
  }

  onToggleFavorite() {
    this.storageService.saveRemoveArticle(this.article);
  }

}
