import 'p2';
import 'pixi';
import 'phaser';

import IGame from '../Fabrique/IGame';

import SoundManager from '../Fabrique/Managers/SoundManager';
import SaveGame from '../Fabrique/SaveGame';
import LabeledButton from '../Fabrique/Objects/LabeledButton';

import {Constants, Atlases, Sounds} from '../Data';

import Gameplay from './Gameplay';

export default class Menu extends Phaser.State {
    public static Name: string = 'menu';

    public name: string = Menu.Name;
    public game: IGame;

    private background: Phaser.Image;
    private logo: Phaser.Image;
    private testImgBtn: LabeledButton;
    private testGrBtn: LabeledButton;
    private sfxBtn: Phaser.Image;
    private musicBtn: Phaser.Image;

    constructor() {
        super();
    }

    public init(): void {
        this.game.world.removeAll();

        //Play background music.
        SoundManager.getInstance(this.game).playMusic(Sounds.MenuMusic);
    }

    public create(): void {
        super.create();

        //Send a screen view to Google to track different states
        // this.game.analytics.google.sendScreenView(this.name);

        this.background = this.game.add.image(0, 0, Atlases.Interface, 'bg_orange');

        this.logo = this.game.add.image(0, 0, Atlases.Interface, 'OG_logo_fullcolor');
        this.logo.anchor.set(0.5);

        let textStyle: any = {font: 'bold ' + 30 * Constants.GAME_SCALE + 'px Arial', fill: '#FFFFFF'};

        //This button uses images for textures, just like normal Phaser.Buttons
        this.testImgBtn = new LabeledButton(this.game, 0, 0, 'LONG TEXT FITS IN BUTTON', textStyle, this.startGame, this);
        this.testImgBtn.setFrames('btn_orange', 'btn_orange', 'btn_orange_onpress', 'btn_orange');

        //This button is made by generating the texture with graphics
        this.testGrBtn = new LabeledButton(this.game, 0, 0, 'PLAY', textStyle, this.startGame, this, 300, 100);
        this.testGrBtn.createTexture(0xf98f25);

        this.sfxBtn = this.game.add.image(0, 0, Atlases.Interface, 'btn_sfx_off');
        this.sfxBtn.inputEnabled = true;
        this.sfxBtn.events.onInputUp.add(this.toggleSfx, this);

        this.musicBtn = this.game.add.image(0, 0, Atlases.Interface, 'btn_music_off');
        this.musicBtn.inputEnabled = true;
        this.musicBtn.events.onInputUp.add(this.toggleMusic, this);

        this.resize();

        this.updateSoundButtons();
    }

    /**
     * Start the game play state
     */
    private startGame(): void {
        this.game.state.add(Gameplay.Name, Gameplay, true);
    }

    private toggleSfx(): void {
        SoundManager.getInstance().toggleSfx();
        this.updateSoundButtons();

        SoundManager.getInstance().play(Sounds.Click);
    }

    private toggleMusic(): void {
        SoundManager.getInstance().toggleMusic();
        this.updateSoundButtons();

        SoundManager.getInstance().play(Sounds.Click);
    }

    private updateSoundButtons(): void {
        let sfxImg: string = SaveGame.getInstance().sfx ? 'btn_sfx_on' : 'btn_sfx_off';
        this.sfxBtn.loadTexture(Atlases.Interface, sfxImg);

        let musicImg: string = SaveGame.getInstance().music ? 'btn_music_on' : 'btn_music_off';
        this.musicBtn.loadTexture(Atlases.Interface, musicImg);
    }

    /**
     * Called every time the rotation or game size has changed.
     * Rescales and repositions the objects.
     */
    public resize(): void {
        this.background.width = this.game.width;
        this.background.height = this.game.height;

        //Reset logo scaling because we're gonna use its size to recalculate the assets scaling
        this.logo.scale.set(1);

        //Calculate new scaling based on the logo size
        let assetsScaling: number = 1;
        if (this.game.width > this.game.height) {
            assetsScaling = this.game.width / (this.logo.width * 1.5);
        } else {
            assetsScaling = this.game.width / this.logo.width;
        }
        //Check that the scaling is not bigger than 1 to prevent unnecessary blurriness
        assetsScaling = assetsScaling > 1 ? 1 : assetsScaling;

        //Set the new scaling and reposition the logo
        this.logo.scale.set(assetsScaling);
        this.logo.alignIn(this.world.bounds, Phaser.CENTER, 0, -80 * Constants.GAME_SCALE);

        //Do the same for the the buttons
        this.testImgBtn.updateScaling(assetsScaling);
        this.testImgBtn.x = this.logo.x / 2;
        this.testImgBtn.y = this.logo.y + this.logo.height * 0.65;

        this.testGrBtn.updateScaling(assetsScaling);
        this.testGrBtn.x = this.logo.x + this.logo.x / 2;
        this.testGrBtn.y = this.testImgBtn.y;

        this.musicBtn.scale.set(assetsScaling);
        this.musicBtn.x = this.game.width - this.musicBtn.width * 1.5;
        this.musicBtn.y = this.game.height - this.musicBtn.height * 1.1;

        this.sfxBtn.scale.set(assetsScaling);
        this.sfxBtn.x = this.musicBtn.x - this.sfxBtn.width * 1.5;
        this.sfxBtn.y = this.musicBtn.y;
    }

    public shutdown(): void {
        super.shutdown();

        this.background = null;
        this.logo = null;
        this.testImgBtn = null;
        this.testGrBtn = null;
        this.sfxBtn = null;
        this.musicBtn = null;
    }
}
